// listTasks.js
const prompt = require('prompt-sync')();
const { spawn } = require('child_process');

module.exports =  task_runner =  () => {
  console.log("=== Match Update System ===");
  console.log("Available commands:");
  console.log("1. list          - Show all available tasks");
  console.log("2. live_match    - Get live match update");
  console.log("3. last_match    - Get last match update");
  console.log("4. next_match    - Get next match update");
  console.log("5. match_summary - Get match summary");
  console.log("6. exit          - Exit program\n");

  const userInput = prompt("Enter your choice (e.g., list, live_match): ").trim();

  if (userInput === 'exit') {
    console.log("Exiting program...");
    process.exit(0);
  }

  // Build arguments for Python command
  const args = userInput === 'list'
    ? ['-m', 'doit', 'list']
    : ['-m', 'doit', 'run', userInput];

  // You can change 'python' to 'python3' if needed on your system
  const pythonProcess = spawn('python', args);

  // Handle Python output
  pythonProcess.stdout.on('data', (data) => {
    console.log(`${data}`);
  });

  // Handle errors
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Error: ${data}`);
  });

  // When process ends, print exit code
  pythonProcess.on('close', (code) => {
    console.log(`\nProcess exited with code ${code}`);
  });

}