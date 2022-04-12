import React from "react";
import {
  View,
  Platform,
  KeyboardAvoidingView,
  Text,
  StyleSheet,
} from "react-native";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import AsyncStorage from "@react-native-community/async-storage";
import NetInfo from "@react-native-community/netinfo";
import * as firebase from "firebase";
import "firebase/firestore";

export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      _id: 0,
      user: {
        _id: "",
        name: "",
        avatar: "",
      },
      isConnected: false,
    };

    const firebaseConfig = {
      apiKey: "AIzaSyBr4yau5Da4bWowcQGDXmGwplnaPhm8shE",
      authDomain: "chatapp-e1ac5.firebaseapp.com",
      projectId: "chatapp-e1ac5",
      storageBucket: "chatapp-e1ac5.appspot.com",
      messagingSenderId: "745622530335",
      appId: "1:745622530335:web:48a31625cf0a0ea0a3282a",
      measurementId: "G-30BR6JSJNX",
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    this.referenceChatMessages = firebase.firestore().collection("messages");

    this.refMsgsUser = null;
  }

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      var data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar,
        },
      });
    });
    this.setState({
      messages: messages,
    });
  };

  addMessage(message) {
    this.referenceChatMessages.add(message);
  }

  componentDidMount() {
    this.getMessages();
    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        firebase.auth().signInAnonymously();
      }

      this.setState({
        _id: user.uid,
        messages: [],
      });

      this.unsubscribe = this.referenceChatMessages
        .orderBy("createdAt", "desc")
        .onSnapshot(this.onCollectionUpdate);
    });

    NetInfo.fetch().then((connection) => {
      if (connection.isConnected) {
        console.log("online");
      } else {
        console.log("offline");
      }
    });
  }
  componentWillUnmout() {
    this.authUnsubscribe();
    this.unsubscribe();
  }

  async getMessages() {
    let messages = "";
    try {
      messages = (await AsyncStorage.getItem("messages")) || [];
      this.setState({
        messages: JSON.parse(messages),
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.saveMessages();
      }
    );
  }

  async saveMessages() {
    try {
      await AsyncStorage.setItem(
        "messages",
        JSON.stringify(this.state.messages)
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  async deleteMessages() {
    try {
      await AsyncStorage.removeItem("messages");
      this.setState({
        messages: [],
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#000",
          },
          left: {
            backgroundColor: "green",
          },
        }}
      />
    );
  }

  renderInputToolbar(props) {
    if (this.state.isConnected == false) {
    } else {
      return <InputToolbar {...props} />;
    }
  }

  render() {
    let name = this.props.route.params.name;
    const { bgColor } = this.props.route.params;

    this.props.navigation.setOptions({ title: name });
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",

          backgroundColor: bgColor ? bgColor : "#fff",
        }}
      >
        <GiftedChat
          style={StyleSheet.giftedChat}
          renderBubble={this.renderBubble.bind(this)}
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={{
            _id: this.state._id,
            name: name,
            avatar: "https://placeimg.com/140/140/any",
          }}
        />
        {Platform.OS === "android" ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}
