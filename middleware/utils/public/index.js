const socket = io('http://localhost:4000')
const form = document.getElementById('myForm');
const responseMessage = document.getElementById('responseMessage');

// Handle form submission
form.addEventListener('submit', (event) => {
      event.preventDefault(); // Prevent the default page reload

      // Create a FormData object to easily collect all form data
      const formData = new FormData(form);

      // Convert FormData to a plain JavaScript object
      const dataObject = {};
      formData.forEach((value, key) => {
        dataObject[key] = value;
      });
      
      // Emit the custom event 'submitFormData' with the data object
      socket.emit('submitFormData', dataObject);
      console.log('Emitted data:', dataObject);

      // Clear the form
      form.reset();

});


 // Listen for the 'formResponse' event from the server
socket.on('formResponse', (response) => {
            responseMessage.textContent = response.message;
            console.log('Server response:', response);
});

socket.on('connect' , (response) =>{
    console.log(response);
} )


socket.on("message" , (data) =>{
    console.log(data)
    socket.emit('message' , 'Hello From Client!');
})