import React from "react";
import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  LogBox,
  StyleSheet,
} from "react-native";
import MapView from "react-native-maps"; // Used to render location within a map
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo"; // Used to establish users connection status
import firebase from "firebase";
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat"; // Bubble component needed to customize the message bubbles
import CustomActions from "./CustomActions";

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.route.params.name, // Initialize state with name received as props from navigate method in Start screen
      colour: this.props.route.params.colour, // Initialize state with colour received as props from navigate method in Start screen
      messages: [], // Set initial messages state to empty array. Data then fetched within componentDidMount()
      uid: 0,
      user: {
        _id: "",
        name: "",
        avatar: "",
      },
      loggedInText: "Offline",
      isConnected: false,
    };
    if (!firebase.apps.length) {
      firebase.initializeApp({
        // Initialize the app by passing the config object provided by Firebase to the initialize app function
        apiKey: "AIzaSyBr4yau5Da4bWowcQGDXmGwplnaPhm8shE",
        authDomain: "chatapp-e1ac5.firebaseapp.com",
        projectId: "chatapp-e1ac5",
        storageBucket: "chatapp-e1ac5.appspot.com",
        messagingSenderId: "745622530335",
        appId: "1:745622530335:web:48a31625cf0a0ea0a3282a",
        measurementId: "G-30BR6JSJNX",
      });
    }
    this.messagesCollection = firebase.firestore().collection("messages");
    LogBox.ignoreLogs([
      // To remove warning message in the console for Android re setting timer
      "Setting a timer",
      "Warning: ...",
      "undefined",
      "Animated.event now requires a second argument for options",
    ]);
  }

  componentDidMount() {
    this.props.navigation.setOptions({ title: this.state.name }); // Setting the header text shown on the screen to be the user name entered on the start screen
    NetInfo.fetch().then((connection) => {
      if (connection.isConnected) {
        // If the user is connected proceed to firebase authentication
        this.setState({ isConnected: true, loggedInText: "Online" });
        this.authUnsubscribe = firebase
          .auth()
          .onAuthStateChanged(async (user) => {
            // Add a database listener to detect changes in authorization status. Store callback to detach listener in authUnsubscribe property
            if (!user) {
              await firebase.auth().signInAnonymously();
            } //
            this.setState({
              uid: user.uid,
              user: {
                _id: user.uid,
                name: this.state.name,
                avatar: "https://placeimg.com/140/140/any",
              },
            });
            // Add a database listener that will retrieve a snapshot of the messages collection whenever a change is detected, and pass it to the onCollectionUpdate function. Store callback to unsubscribe in unsubscribeMessagesCollection object
            this.unsubscribeMessagesCollection = this.messagesCollection
              .orderBy("createdAt", "desc")
              .onSnapshot(this.onCollectionUpdate);
          });
      } else {
        this.setState({ isConnected: false });
        this.getMessages(); // If the user is offline get messages from async storage
      }
    });
  }

  onCollectionUpdate = (querySnapshot) => {
    // When the database is updated, set the messages state with the updated data received in the snapshot
    const messages = [];
    querySnapshot.forEach((doc) => {
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar,
        },
        image: data.image,
        location: data.location,
      });
    });
    this.setState({ messages: messages }, () => {
      // setState is asynchronous so use callback parameter to invoke saveMessages only once the messages state has been updated
      this.saveMessages(); // Each time the messages state is updated, save the new version to async storage
    });
  };

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

  async getMessages() {
    let messages = "";
    try {
      messages = (await AsyncStorage.getItem("messages")) || [];
      this.setState({ messages: JSON.parse(messages) });
    } catch (error) {
      console.log(error.message);
    }
  }

  onSend(newMessage = []) {
    // onSend triggers the add message function to update the database. The database listener then triggers a state update using onCollectionUpdate when the new message is detected
    this.addMessage(newMessage);
  }

  addMessage(newMessage) {
    const latestMessage = newMessage[0]; // A new message in Gifted Chat is an array containing a new message object. We therefore need to first extract the object from the array
    this.messagesCollection.add({
      // Use add method to add new message to the messages collection in the firestore database
      _id: latestMessage._id,
      text: latestMessage.text || "",
      createdAt: latestMessage.createdAt,
      user: latestMessage.user,
      image: latestMessage.image || "",
      location: latestMessage.location || null,
    });
  }

  renderBubble(props) {
    // Customize the bubble styling
    return (
      <Bubble
        {...props}
        wrapperStyle={{ right: { backgroundColor: "#4b5320" } }}
      />
    );
  }

  renderInputToolbar(props) {
    // Input bar for messages is only rendered if the user is online
    if (this.state.isConnected === false) {
    } else {
      return <InputToolbar {...props} />;
    }
  }

  renderCustomActions = (props) => {
    // Returns action button to access communication features via an action sheet
    return <CustomActions {...props} />; // Spread operator used to assign copy of props to the component, to which image or location may be added via actions
  };

  renderCustomView(props) {
    // Returns a mapview in the message bubble if a location has been added to the current message
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          showsUserLocation={true}
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }

  componentWillUnmount() {
    this.authUnsubscribe(); // Remove authorization listener
    this.unsubscribeMessagesCollection(); // Remove database messages collection listener
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: this.state.colour }}>
        <Text style={styles.loggedInText}>{this.state.loggedInText}</Text>
        <GiftedChat
          messages={this.state.messages}
          onSend={(newMessage) => this.onSend(newMessage)}
          renderBubble={this.renderBubble}
          renderInputToolbar={this.renderInputToolbar.bind(this)} // Function needs to be bound to Chat component in order to read the isConnected state
          renderUsernameOnMessage={true}
          renderActions={this.renderCustomActions}
          renderCustomView={this.renderCustomView}
          user={{
            _id: this.state.uid,
            name: this.state.name,
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

const styles = StyleSheet.create({
  loggedInText: {
    color: "white",
  },
});
