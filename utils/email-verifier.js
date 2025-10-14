const storage = require('node-persist');

module.exports =  waitForVerification = (timeoutInMinutes = 5) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const timeout = timeoutInMinutes * 60 * 1000; // 5 minutes in milliseconds

    const intervalId = setInterval(async () => {
      const isVerified = await storage.getItem('status');
      const now = Date.now();

      if (isVerified === true ) {
        // Condition met, resolve the promise and clear the timer
        clearInterval(intervalId);
        console.log('Email verified successfully!');
        resolve(true);
      } else if (now - startTime > timeout) {
        // Timeout exceeded, resolve the promise and clear the timer
        clearInterval(intervalId);
        console.log('Timeout exceeded. Proceeding with remaining code.');
        resolve(false);
      } else {
        console.log('Waiting for email verification...');
      }
    }, 5000); // Check every 5 seconds
  });
}
