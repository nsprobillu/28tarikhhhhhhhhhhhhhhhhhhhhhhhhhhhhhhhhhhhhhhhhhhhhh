import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth.js';
import { pool } from '../db/init.js';
import compression from 'compression';
import { rateLimitMiddleware, verifyCaptcha, checkCaptchaRequired, rateLimitStore } from '../middleware/rateLimit.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Get a specific temporary email
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [emails] = await pool.query(
      'SELECT * FROM temp_emails WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (emails.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }

    res.json(emails[0]);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch email' });
  }
});

// Get received emails for a specific temporary email with pagination
router.get('/:id/received', authenticateToken, async (req, res) => {
  try {
    // Get pagination parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // First get the total count
    const [countResult] = await pool.query(`
      SELECT COUNT(*) as total
      FROM received_emails re
      JOIN temp_emails te ON re.temp_email_id = te.id
      WHERE te.id = ? AND te.user_id = ?
    `, [req.params.id, req.user.id]);

    const totalCount = countResult[0].total;

    // Then get the paginated data
    const [emails] = await pool.query(`
      SELECT re.*, te.email as temp_email
      FROM received_emails re
      JOIN temp_emails te ON re.temp_email_id = te.id
      WHERE te.id = ? AND te.user_id = ?
      ORDER BY re.received_at DESC
      LIMIT ? OFFSET ?
    `, [req.params.id, req.user.id, limit, offset]);

    // Return the data with pagination metadata
    res.json({
      data: emails,
      metadata: {
        total: totalCount,
        page: page,
        limit: limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Failed to fetch received emails:', error);
    res.status(400).json({ error: 'Failed to fetch received emails' });
  }
});

// Create email with rate limit and optional CAPTCHA verification
router.post('/create', authenticateToken, rateLimitMiddleware, checkCaptchaRequired, verifyCaptcha, async (req, res) => {
  try {
    const { email, domainId } = req.body;
    const id = uuidv4();
    
    // Set expiry date to 2 months from now
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 2);
    
    // If CAPTCHA was provided and successfully verified, reset rate limit counter
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (req.body.captchaResponse) {
      if (req.user) {
        // For authenticated users
        const userId = req.user.id;
        if (rateLimitStore.userLimits[userId]) {
          rateLimitStore.userLimits[userId].count = 0; // Reset counter
          rateLimitStore.userLimits[userId].captchaRequired = false; // No longer require CAPTCHA
        }
      } else {
        // For anonymous users
        if (rateLimitStore.limits[clientIp]) {
          rateLimitStore.limits[clientIp].count = 0; // Reset counter
          rateLimitStore.limits[clientIp].captchaRequired = false; // No longer require CAPTCHA
        }
      }
    }

    const [result] = await pool.query(
      'INSERT INTO temp_emails (id, user_id, email, domain_id, expires_at) VALUES (?, ?, ?, ?, ?)',
      [id, req.user.id, email, domainId, expiresAt]
    );

    const [createdEmail] = await pool.query(
      'SELECT * FROM temp_emails WHERE id = ?',
      [id]
    );

    res.json(createdEmail[0]);
  } catch (error) {
    console.error('Create email error:', error);
    res.status(400).json({ error: 'Failed to create temporary email' });
  }
});

router.delete('/delete/:id', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // First, delete all received emails
    const [deleteReceivedResult] = await connection.query(
      'DELETE FROM received_emails WHERE temp_email_id = ?',
      [req.params.id]
    );

    // Then, delete the temporary email
    const [deleteTempResult] = await connection.query(
      'DELETE FROM temp_emails WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (deleteTempResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Email not found' });
    }

    await connection.commit();
    res.json({ message: 'Email deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Delete email error:', error);
    res.status(400).json({ error: 'Failed to delete email' });
  } finally {
    connection.release();
  }
});

// Get user emails with pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get pagination parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    // First get the total count with search
    let countQuery = 'SELECT COUNT(*) as total FROM temp_emails WHERE user_id = ?';
    let countParams = [req.user.id];
    
    // Add search condition if search term is provided
    if (search) {
      countQuery += ' AND email LIKE ?';
      countParams.push(`%${search}%`);
    }
    
    const [countResult] = await pool.query(countQuery, countParams);
    const totalCount = countResult[0].total;

    // Then get the paginated data with search
    let dataQuery = 'SELECT * FROM temp_emails WHERE user_id = ?';
    let dataParams = [req.user.id];
    
    // Add search condition if search term is provided
    if (search) {
      dataQuery += ' AND email LIKE ?';
      dataParams.push(`%${search}%`);
    }
    
    dataQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    dataParams.push(limit, offset);
    
    const [emails] = await pool.query(dataQuery, dataParams);

    // Return the data with pagination metadata
    res.json({
      data: emails,
      metadata: {
        total: totalCount,
        page: page,
        limit: limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Failed to fetch emails:', error);
    res.status(400).json({ error: 'Failed to fetch emails' });
  }
});

// Delete a received email
router.delete('/:tempEmailId/received/:emailId', authenticateToken, async (req, res) => {
  try {
    // First check if the temp email belongs to the user
    const [tempEmails] = await pool.query(
      'SELECT id FROM temp_emails WHERE id = ? AND user_id = ?',
      [req.params.tempEmailId, req.user.id]
    );

    if (tempEmails.length === 0) {
      return res.status(404).json({ error: 'Temporary email not found' });
    }

    // Delete the received email
    const [result] = await pool.query(
      'DELETE FROM received_emails WHERE id = ? AND temp_email_id = ?',
      [req.params.emailId, req.params.tempEmailId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Received email not found' });
    }

    res.json({ message: 'Email deleted successfully' });
  } catch (error) {
    console.error('Failed to delete received email:', error);
    res.status(400).json({ error: 'Failed to delete received email' });
  }
});

// Bulk delete received emails
router.post('/:tempEmailId/received/bulk/delete', authenticateToken, async (req, res) => {
  const { emailIds } = req.body;
  
  if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
    return res.status(400).json({ error: 'Invalid email IDs' });
  }

  try {
    // First check if the temp email belongs to the user
    const [tempEmails] = await pool.query(
      'SELECT id FROM temp_emails WHERE id = ? AND user_id = ?',
      [req.params.tempEmailId, req.user.id]
    );

    if (tempEmails.length === 0) {
      return res.status(404).json({ error: 'Temporary email not found' });
    }

    // Delete the received emails
    const [result] = await pool.query(
      'DELETE FROM received_emails WHERE id IN (?) AND temp_email_id = ?',
      [emailIds, req.params.tempEmailId]
    );

    res.json({ 
      message: 'Emails deleted successfully',
      count: result.affectedRows
    });
  } catch (error) {
    console.error('Failed to delete received emails:', error);
    res.status(400).json({ error: 'Failed to delete received emails' });
  }
});

// Get public emails (no auth required)
router.get('/public/:email', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=5'); // Cache for 5 seconds
    const [emails] = await pool.query(`
      SELECT re.*, te.email as temp_email
      FROM received_emails re
      JOIN temp_emails te ON re.temp_email_id = te.id
      WHERE te.email = ?
      ORDER BY re.received_at DESC
    `, [req.params.email]);

    res.json(emails);
  } catch (error) {
    console.error('Failed to fetch public emails:', error);
    res.status(400).json({ error: 'Failed to fetch emails' });
  }
});

// Create public temporary email (no auth required) with rate limiting and CAPTCHA
router.post('/public/create', rateLimitMiddleware, checkCaptchaRequired, verifyCaptcha, async (req, res) => {
  try {
    const { email, domainId } = req.body;
    const id = uuidv4();
    
    // Add CAPTCHA information to response if required
    if (res.locals.captchaRequired && !req.body.captchaResponse) {
      return res.status(400).json({
        error: 'CAPTCHA_REQUIRED',
        captchaRequired: true,
        captchaSiteKey: res.locals.captchaSiteKey,
        message: 'You have exceeded the rate limit. Please complete the CAPTCHA.'
      });
    }
    
    // Set expiry date to 48 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);
    
    // If CAPTCHA was provided and successfully verified, reset rate limit counter
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (req.body.captchaResponse) {
      if (rateLimitStore.limits[clientIp]) {
        rateLimitStore.limits[clientIp].count = 0; // Reset counter
        rateLimitStore.limits[clientIp].captchaRequired = false; // No longer require CAPTCHA
      }
    }

    const [result] = await pool.query(
      'INSERT INTO temp_emails (id, email, domain_id, expires_at) VALUES (?, ?, ?, ?)',
      [id, email, domainId, expiresAt]
    );

    const [createdEmail] = await pool.query(
      'SELECT * FROM temp_emails WHERE id = ?',
      [id]
    );

    res.json(createdEmail[0]);
  } catch (error) {
    console.error('Create public email error:', error);
    res.status(400).json({ error: 'Failed to create temporary email' });
  }
});

// Admin route to fetch all emails (admin-only)
router.get('/admin/all', async (req, res) => {
  try {
    // Check admin passphrase
    const adminAccess = req.headers['admin-access'];
    if (adminAccess !== process.env.ADMIN_PASSPHRASE) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await pool.query(`
      SELECT COUNT(*) as total
      FROM received_emails
    `);

    const totalCount = countResult[0].total;

    // Fetch paginated emails
    const [emails] = await pool.query(`
      SELECT re.*, te.email as temp_email
      FROM received_emails re
      JOIN temp_emails te ON re.temp_email_id = te.id
      ORDER BY re.received_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    res.json({
      data: emails,
      metadata: {
        total: totalCount,
        page: page,
        limit: limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Failed to fetch admin emails:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// Get all users with advanced filtering (admin-only)
router.get('/admin/users', async (req, res) => {
  try {
    const adminAccess = req.headers['admin-access'];
    if (adminAccess !== process.env.ADMIN_PASSPHRASE) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const {
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
      emailCountMin,
      emailCountMax,
      dateStart,
      dateEnd,
      isActive,
      hasCustomDomain
    } = req.query;

    let query = `
      SELECT 
        u.id,
        u.email,
        u.created_at,
        u.last_login,
        u.last_activity_at,
        COUNT(DISTINCT te.id) as email_count,
        COUNT(DISTINCT cd.id) as custom_domain_count,
        (
          SELECT COUNT(*)
          FROM received_emails re
          JOIN temp_emails te2 ON re.temp_email_id = te2.id
          WHERE te2.user_id = u.id
        ) as received_email_count
      FROM users u
      LEFT JOIN temp_emails te ON u.id = te.user_id
      LEFT JOIN user_domains cd ON u.id = cd.user_id
      WHERE 1=1
    `;

    const queryParams = [];

    // Apply filters
    if (search) {
      query += ` AND u.email LIKE ?`;
      queryParams.push(`%${search}%`);
    }

    if (emailCountMin) {
      query += ` AND (SELECT COUNT(*) FROM temp_emails WHERE user_id = u.id) >= ?`;
      queryParams.push(parseInt(emailCountMin));
    }

    if (emailCountMax) {
      query += ` AND (SELECT COUNT(*) FROM temp_emails WHERE user_id = u.id) <= ?`;
      queryParams.push(parseInt(emailCountMax));
    }

    if (dateStart) {
      query += ` AND u.created_at >= ?`;
      queryParams.push(dateStart);
    }

    if (dateEnd) {
      query += ` AND u.created_at <= ?`;
      queryParams.push(dateEnd);
    }

    if (isActive === 'true') {
      query += ` AND u.last_activity_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
    } else if (isActive === 'false') {
      query += ` AND (u.last_activity_at IS NULL OR u.last_activity_at < DATE_SUB(NOW(), INTERVAL 7 DAY))`;
    }

    if (hasCustomDomain === 'true') {
      query += ` AND EXISTS (SELECT 1 FROM user_domains WHERE user_id = u.id)`;
    } else if (hasCustomDomain === 'false') {
      query += ` AND NOT EXISTS (SELECT 1 FROM user_domains WHERE user_id = u.id)`;
    }

    // Group by user
    query += ` GROUP BY u.id`;

    // Apply sorting
    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), offset);

    // Get total count for pagination
    const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(DISTINCT u.id) as total FROM');
    const [countResult] = await pool.query(countQuery, queryParams);
    const total = countResult[0].total;

    // Execute main query
    const [users] = await pool.query(query, queryParams);

    res.json({
      data: users,
      metadata: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Admin route to send bulk emails (updated with detailed implementation)
router.post('/admin/bulk-send', async (req, res) => {
  // Check admin passphrase
  const adminAccess = req.headers['admin-access'];
  if (adminAccess !== process.env.ADMIN_PASSPHRASE) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { userIds, email, smtp } = req.body;

  if (!userIds?.length || !email?.subject || !email?.body || !smtp) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    console.log('Creating transporter with SMTP settings:', {
      host: smtp.host,
      port: smtp.port,
      auth: {
        user: smtp.username
      }
    });

    // Create transporter with provided SMTP settings
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: parseInt(smtp.port),
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtp.username,
        pass: smtp.password
      },
      tls: {
        rejectUnauthorized: false // Only use this in development!
      }
    });

    // Verify SMTP connection
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    // Get users' emails
    const [users] = await pool.query(
      'SELECT email FROM users WHERE id IN (?)',
      [userIds]
    );

    console.log(`Found ${users.length} users to send emails to`);

    // Send emails
    const results = await Promise.allSettled(
      users.map(async user => {
        console.log(`Sending email to ${user.email}`);
        try {
          const result = await transporter.sendMail({
            from: `"${smtp.from_name}" <${smtp.from_email}>`,
            to: user.email,
            subject: email.subject,
            html: email.body
          });
          console.log(`Email sent successfully to ${user.email}:`, result);
          return result;
        } catch (error) {
          console.error(`Failed to send email to ${user.email}:`, error);
          throw error;
        }
      })
    );

    // Count successes and failures
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Email sending complete: ${succeeded} succeeded, ${failed} failed`);

    res.json({
      message: `Sent ${succeeded} emails successfully, ${failed} failed`,
      succeeded,
      failed,
      details: results.map((result, index) => ({
        email: users[index].email,
        status: result.status,
        error: result.status === 'rejected' ? result.reason : null
      }))
    });
  } catch (error) {
    console.error('Failed to send bulk emails:', error);
    res.status(500).json({ 
      error: 'Failed to send emails',
      details: error.message
    });
  }
});

// Compress responses
router.use(compression());

export default router;
