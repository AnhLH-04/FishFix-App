import apiClient from './apiClient';

/**
 * Notification Service
 * Handles push notifications and real-time updates
 */

/**
 * Send booking notification to worker
 * @param {string} workerId - Worker ID
 * @param {Object} bookingData - Booking information
 * @param {Object} jobData - Job information
 * @returns {Promise<void>}
 */
export const notifyWorkerNewBooking = async (workerId, bookingData, jobData) => {
  try {
    console.log('🔔 Sending booking notification to worker:', workerId);
    
    // TODO: Implement real push notification via Firebase/OneSignal
    // For now, this can be handled via polling or websocket
    
    const notification = {
      type: 'new_booking',
      workerId: workerId,
      bookingId: bookingData.bookingId,
      jobId: bookingData.jobId,
      title: 'Yêu cầu mới',
      message: `Bạn có công việc mới: ${jobData.title}`,
      data: {
        booking: bookingData,
        job: jobData,
      },
      priority: 'high',
      sound: 'default',
    };
    
    // Send via API or Socket
    // await apiClient.post('/api/notifications/send', notification);
    
    console.log('✅ Notification sent successfully');
    return notification;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    throw error;
  }
};

/**
 * Navigate worker to IncomingRequestScreen (for testing)
 * This simulates receiving a push notification
 * @param {Object} navigation - React Navigation object
 * @param {Object} bookingData - Booking information
 * @param {Object} jobData - Job information
 */
export const simulateWorkerNotification = (navigation, bookingData, jobData) => {
  console.log('🔔 Simulating worker notification...');
  console.log('📦 Booking:', bookingData);
  console.log('💼 Job:', jobData);
  
  // Navigate to IncomingRequestScreen with booking data
  navigation.navigate('IncomingRequest', {
    booking: bookingData,
    job: jobData,
  });
};

export default {
  notifyWorkerNewBooking,
  simulateWorkerNotification,
};
