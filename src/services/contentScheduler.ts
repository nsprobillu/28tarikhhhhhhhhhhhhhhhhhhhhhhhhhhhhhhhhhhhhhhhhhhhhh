import { BlogContentGenerator } from './blogContentGenerator';
import axios from 'axios';

export class ContentScheduler {
  private generator: BlogContentGenerator;
  
  constructor() {
    this.generator = new BlogContentGenerator();
  }

  private schedule = {
    'Monday': ['how-to'],
    'Wednesday': ['review'],
    'Friday': ['comparison']
  };

  private categories = [
    'Email Security',
    'Privacy Protection',
    'Digital Identity',
    'Online Safety',
    'Data Protection',
    'Cybersecurity'
  ];

  public async executeSchedule() {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const contentTypes = this.schedule[today];

    if (!contentTypes) return;

    for (const type of contentTypes) {
      try {
        // 1. Generate topics
        const category = this.categories[Math.floor(Math.random() * this.categories.length)];
        const topics = await this.generator.generateTopics(category);
        
        // 2. Generate content
        const content = await this.generator.generatePost({
          topic: topics[0],
          type: type as any,
          wordCount: 1500,
          tone: 'professional',
          keywords: topics[0].split(' ')
        });

        // 3. Validate content
        const isValid = await this.generator.validateContent(content.content);
        
        if (isValid) {
          // 4. Post to blog
          await axios.post(
            `${import.meta.env.VITE_API_URL}/blog/posts`,
            content,
            {
              headers: {
                'Admin-Access': import.meta.env.VITE_ADMIN_PASSPHRASE
              }
            }
          );

          console.log(`Successfully published: ${content.title}`);
        }
      } catch (error) {
        console.error('Failed to generate/publish content:', error);
      }
    }
  }
}