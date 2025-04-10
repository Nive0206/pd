import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Paper, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");

  const sendMessage = async () => {
    if (!message.trim()) {
      setError("Message cannot be empty.");
      return;
    }
    setError(""); // Clear any previous errors

    try {
      const res = await axios.post("https://your-chatbot-api.com/chat", {
        message: message,
      });

      if (res.data && res.data.reply) {
        setResponse(res.data.reply);
      } else {
        setResponse("Unexpected response from chatbot.");
      }
    } catch (err) {
      setResponse("Sorry, an error occurred while processing your request.");
    }
  };

  return (
    <Paper elevation={3} style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Chatbot
      </Typography>
      <TextField
        label="Type your message"
        variant="outlined"
        fullWidth
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        error={!!error}
        helperText={error}
        style={{ marginBottom: "10px" }}
      />
      <Button
        variant="contained"
        color="primary"
        endIcon={<SendIcon />}
        onClick={sendMessage}
      >
        Send
      </Button>
      {response && (
        <Paper elevation={1} style={{ marginTop: "10px", padding: "10px" }}>
          <Typography variant="body1"><strong>Chatbot:</strong> {response}</Typography>
        </Paper>
      )}
    </Paper>
  );
};

export default Chatbot;
