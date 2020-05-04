const form = document.querySelector("form")
const input = document.querySelector(".input")
const messages = document.querySelector(".messages")
const username = prompt("Enter your nickname: ", "")
const socket = io()

form.addEventListener("submit", function(event) {
  event.preventDefault()

  addMessage(username + ": " + input.value)

  socket.emit("chat_message", {
    // username: this.username,
    message: input.value
  })

  input.value = ""
  return false
}, false)

socket.on("chat_message", function(data) {
  addMessage(data.username + ": " + data.message)
})

socket.on("chat_quote", function(data) {
  addMessage("Quotebot: " + data)
})

socket.on("user_join", function(data) {
  addMessage(data + " just walked into the chat!")
})

socket.on("user_leave", function(data) {
  addMessage(data + " has left the chat.")
})

addMessage("You have joined the chat as '" + username + "'.")
socket.emit("user_join", username)

function addMessage(message) {
  const li = document.createElement("li")
  li.innerHTML = message
  messages.appendChild(li)
  window.scrollTo(0, document.body.scrollHeight)
}