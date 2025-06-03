// services/zoom.service.ts
import jwt from 'jsonwebtoken';

interface ZoomMeetingRequest {
  topic: string;
  start_time: string;
  duration: number;
  timezone?: string;
  password?: string;
  agenda?: string;
  settings?: {
    host_video?: boolean;
    participant_video?: boolean;
    join_before_host?: boolean;
    mute_upon_entry?: boolean;
    watermark?: boolean;
    use_pmi?: boolean;
    approval_type?: number;
    audio?: string;
    auto_recording?: string;
    waiting_room?: boolean;
  };
}

interface ZoomMeetingResponse {
  id: string;
  join_url: string;
  password: string;
  topic: string;
  start_time: string;
  duration: number;
  start_url: string;
  uuid: string;
}

class ZoomService {
  private baseUrl = 'https://api.zoom.us/v2';
  private clientId: string;
  private clientSecret: string;
  private accountId: string;

  constructor() {
    this.clientId = process.env.ZOOM_CLIENT_ID || '';
    this.clientSecret = process.env.ZOOM_CLIENT_SECRET || '';
    this.accountId = process.env.ZOOM_ACCOUNT_ID || '';

    if (!this.isConfigured()) {
      throw new Error('Zoom credentials not configured. Required: ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, ZOOM_ACCOUNT_ID');
    }

    console.log('✅ Zoom service initialized successfully');
  }

  // Get access token using Server-to-Server OAuth
  private async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await fetch('https://zoom.us/oauth/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=account_credentials&account_id=${this.accountId}`
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Zoom token error response:', errorText);
        throw new Error(`Failed to get Zoom access token: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error getting Zoom access token:', error);
      throw error;
    }
  }

  // Create a Zoom meeting
  async createMeeting(meetingData: ZoomMeetingRequest, userEmail?: string): Promise<ZoomMeetingResponse> {
    try {
      const accessToken = await this.getAccessToken();
      
      // Default to 'me' if no specific user email provided
      const userId = userEmail || 'me';
      
      const meetingPayload = {
        topic: meetingData.topic,
        type: 2, // Scheduled meeting
        start_time: meetingData.start_time,
        duration: meetingData.duration,
        timezone: meetingData.timezone || 'UTC',
        password: meetingData.password || this.generateMeetingPassword(),
        agenda: meetingData.agenda || '',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,           // ✅ Allow participants to join without waiting for host
          mute_upon_entry: true,
          watermark: false,
          use_pmi: false,
          approval_type: 0,                 // Automatically approve all participants
          audio: 'both',                    // Both telephony and VoIP
          auto_recording: 'none',
          waiting_room: false,              // ✅ Disable waiting room to avoid delays
          enable_dedicated_client: false,   // Allow browser joining
          cn_meeting: false,                // For China
          in_meeting: false,                // For India
          breakout_room: {
            enable: false
          },
          ...meetingData.settings
        }
      };

      console.log('Creating Zoom meeting:', meetingData.topic);

      const response = await fetch(`${this.baseUrl}/users/${userId}/meetings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Zoom API error:', errorData);
        throw new Error(`Failed to create Zoom meeting: ${errorData.message || response.status}`);
      }

      const meeting = await response.json();
      
      console.log('✅ Zoom meeting created successfully:', meeting.id);
      
      return {
        id: meeting.id.toString(),
        join_url: meeting.join_url,
        password: meeting.password,
        topic: meeting.topic,
        start_time: meeting.start_time,
        duration: meeting.duration,
        start_url: meeting.start_url,
        uuid: meeting.uuid
      };

    } catch (error) {
      console.error('❌ Error creating Zoom meeting:', error);
      throw error;
    }
  }

  // Update a Zoom meeting
  async updateMeeting(meetingId: string, meetingData: Partial<ZoomMeetingRequest>, userEmail?: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Zoom update error:', errorData);
        throw new Error(`Failed to update Zoom meeting: ${errorData.message || response.status}`);
      }

      console.log('✅ Zoom meeting updated successfully:', meetingId);

    } catch (error) {
      console.error('❌ Error updating Zoom meeting:', error);
      throw error;
    }
  }

  // Delete a Zoom meeting
  async deleteMeeting(meetingId: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Zoom delete error:', errorData);
        throw new Error(`Failed to delete Zoom meeting: ${errorData.message || response.status}`);
      }

      console.log('✅ Zoom meeting deleted successfully:', meetingId);

    } catch (error) {
      console.error('❌ Error deleting Zoom meeting:', error);
      throw error;
    }
  }

  // Get meeting details
  async getMeeting(meetingId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/meetings/${meetingId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Zoom get meeting error:', errorData);
        throw new Error(`Failed to get Zoom meeting: ${errorData.message || response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('❌ Error getting Zoom meeting:', error);
      throw error;
    }
  }

  // Get meeting recordings (for future transcript feature)
  async getMeetingRecordings(meetingId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/meetings/${meetingId}/recordings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Zoom recordings error:', errorData);
        throw new Error(`Failed to get meeting recordings: ${errorData.message || response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('❌ Error getting meeting recordings:', error);
      throw error;
    }
  }

  // Generate a random meeting password
  private generateMeetingPassword(): string {
    const chars = '0123456789';
    let password = '';
    for (let i = 0; i < 6; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Validate if Zoom is properly configured
  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret && this.accountId);
  }

  // Test the Zoom connection
  async testConnection(): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      
      // Test by getting user info
      const response = await fetch(`${this.baseUrl}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const success = response.ok;
      
      if (success) {
        console.log('✅ Zoom connection test successful');
      } else {
        console.error('❌ Zoom connection test failed:', await response.text());
      }
      
      return success;

    } catch (error) {
      console.error('❌ Zoom connection test failed:', error);
      return false;
    }
  }
}

export const zoomService = new ZoomService();
