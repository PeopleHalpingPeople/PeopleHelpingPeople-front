import React, { useEffect, useState } from 'react';
import './styles/style.css';
const HOST = 'http://localhost:3000';
const { Socket } = require('socket.io-client');
import io from 'socket.io-client';
import { useAuth0 } from "@auth0/auth0-react";
import { filteredMessages, newMessage } from '../store/messages.js';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import SocketWrapper from './socket';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import './styles/style.css';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: '0 auto',
    marginTop: 20,
    maxWidth: 800,
    maxHeight: 400,
    background: '#faf8f1',
    borderWidth: 3,
    borderColor: '#645853',
    borderStyle: 'solid',
  },
  welcome: {
    textAlign: 'center',
    marginTop: 20,
  },
  chatbox: {
    overflow: 'auto',
    padding: 10,
  },
  input: {
    textAlign: 'center',
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  inputBox: {
    width: 680,
    background: '#faf8f1',
    borderWidth: 1,
    borderColor: '#645853',
    borderStyle: 'solid',
  },
  button: {
    width: 100,
    paddingTop: 15,
    paddingBottom: 15,
    background: '#44392e',
    color: '#faf8f1',
  },
}));

function Chat(props) {
  const classes = useStyles();

  // const [socket, setSocket] = useState({});
  const [messageText, setMessageText] = useState('');

  const { user, isAuthenticated, isLoading } = useAuth0();
  console.log(user);
  const { socket } = props;
  // useEffect(() => {
  //   setSocket(io(HOST));
  // }, []);
  // let socket = io.connect(HOST);
  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (user) {
      socket.emit('add user', user.given_name );
    }
  }, [user]);

  socket.on('connect', () => {
    console.log('user is connected');
  });

  socket.on('message list', (data) => {
    props.filteredMessages(data);
  });

  socket.on('message', (data) => {
    const { User_Message, username } = data;
    // socket.emit('chat message', data)
    // console.log('DATA---', data);
    props.newMessage(data);
    //TODO: import Regex conditionals
    //TODO: emit private or global
  });

  const newMessage = (event) => {
    // if prevent default removed, page refreshes and never get dups. needs JUST COMPONENT to re-render without dups
    event.preventDefault();
    console.log('WORKING?', event);

    console.log('messageTEXT', messageText);

    let regex1 = /(\S+\w+\s+){2}/gm;
    let regex1string = messageText.match(regex1);

    let messageConstructor = messageText.split(' ');
    console.log('messageConst', messageConstructor);
    let messageType = messageConstructor[0];
    console.log('messageType', messageType);
  
    let privateReceiver = null;
    if (messageType === '/to') {
      privateReceiver = regex1string[0].split(' ')[1];
    }
    console.log('privateReceiver', privateReceiver);

    if(messageType === '/to'){
      socket.emit('private message', { User_Message: messageText, username: user.given_name, privateReceiver, messageType })
    } else {
      socket.emit('message1', {User_Message: messageText, username: user.given_name});
    }

    // socket.emit('message1', {User_Message: messageText, username: user.given_name});
    event.target.reset();
    // console.log('TEXT', messageText);
    // props.newMessage(messageText);
    setMessageText('');
  };



  // console.log('EVENT TEXT', {messageText});
  // console.log('MESSAGES---', props.messageReducer.chatMessages);

  let messageList = props.messageReducer.chatMessages.allMessages;

  // const handleSubmit = (event) => {
  //   console.log('HANDLESUB---', event);
  //   setMessageText({...messageText, messageText: event.target.value})
  // }

  return (
    <>
      <h1 className={classes.welcome} id="welcome">
        {user ?
          <p>Welcome, {user.given_name}</p> : ''
        }
      </h1>
      <Card className={classes.root} style={{maxHeight: 500, overflow: 'auto'}}>
        <CardContent>
          <Typography className={classes.chatbox} id="chatbox" variant="body2" color="textSecondary" component="span">
            {user && messageList ? messageList.map(message => {
              return (
                <p>{message.username}: {message.User_Message}</p>
              )
            })
              : null}
          </Typography>
        </CardContent>
      </Card>
      {user ?
        <form className={classes.input} onSubmit={newMessage}>
          <TextField onChange={(e) => setMessageText(e.target.value)} className={classes.inputBox} id="outlined-basic" label="type message" variant="outlined" type="text" />
          <Button className={classes.button} id="sendbutton" variant="contained" type="submit">Send</Button>
        </form> : null}
    </>
  )
}

const mapStateToProps = state => ({
  messageReducer: state.messageReducer
});

const mapDispatchToProps = (dispatch, getState) => ({
  filteredMessages: (message) => dispatch(filteredMessages(message)),
  newMessage: (message) => dispatch(newMessage(message))
});

export default connect(mapStateToProps, mapDispatchToProps)(Chat);