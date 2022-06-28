import React, { Component } from "react";
import { StatusBar } from "expo-status-bar";
import title from "./components/title";
import Chat from "./components/Chat";
import "react-native-gesture-handler";
import CustomActions from "./components/CustomActions";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  Alert,
  ScrollView,
} from "react-native";
import { render } from "react-dom";

const Stack = createStackNavigator();
export default class HelloWorld extends Component {
  constructor(props) {
    super(props);
    this.state = { text: "" };
  }
  alertMyText(input = []) {
    Alert.alert(input.text);
  }
  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  render() {
    return (
      <NavigationContainer>
        <View
          style={{ flex: 1, justifyContent: "center", flexDirection: "column" }}
        >
          <Stack.Navigator initialRouteName="title">
            <Stack.Screen name="Howdy Chat" component={title} />
            <Stack.Screen name="Chat Screen" component={Chat} />
          </Stack.Navigator>
        </View>
      </NavigationContainer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  box1: {
    flex: 10,
    backgroundColor: "blue",
  },
  box2: {
    flex: 120,
    backgroundColor: "red",
  },
  box3: {
    flex: 50,
    backgroundColor: "green",
  },
});
