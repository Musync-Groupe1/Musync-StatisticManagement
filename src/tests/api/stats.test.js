import request from 'supertest';
import app from '../../pages/api/stats';

describe('GET /api/stats', () => {
  it('should fetch and save user stats from Spotify', async () => {
    const response = await request(app)
      .get('/api/stats?userId=testUserId&platform=spotify');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('userId');
    expect(response.body).toHaveProperty('platform');
    expect(response.body).toHaveProperty('topTracks');
  });

  it('should fetch and save user stats from Apple Music', async () => {
    const response = await request(app)
      .get('/api/stats?userId=testUserId&platform=appleMusic');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('userId');
    expect(response.body).toHaveProperty('platform');
    expect(response.body).toHaveProperty('topTracks');
  });
});
