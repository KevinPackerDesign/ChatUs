import React from "react";
import {
  View,
  Text,
  Button,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";

const image = require("../assets/Background.png");

export default class Title extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      bgColor: "",
    };
  }

  changebgColor = (newColor) => {
    this.setState({ bgColor: newColor });
  };

  color = {
    red: "#FF0000",
    gray: "#d3d3d3",
    ODgreen: "#006400",
    white: "#fff",
  };
  render() {
    return (
      <View style={styles.container}>
        <ImageBackground source={image} resizeMode="cover" style={styles.image}>
          <View>
            <Text style={styles.title}>Howdy Chat</Text>
          </View>

          <View style={styles.box}>
            <View style={styles.inputBox}>
              <TextInput
                style={{
                  height: 40,
                  width: 150,
                  fontSize: 16,
                  borderWidth: 0,
                }}
                onChangeText={(name) => this.setState({ name })}
                placeholder="Your Name"
              />
            </View>
            <View style={styles.colorBox}>
              <Text style={styles.colorText}>Choose a Color</Text>
              <View style={styles.colorPalette}>
                <View style={styles.colorSelection}>
                  <TouchableOpacity
                    accessible={true}
                    onPress={() => {
                      this.changebgColor(this.color.red);
                    }}
                    style={styles.colorSelection}
                  >
                    <View style={styles.color1}></View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessible={true}
                    onPress={() => {
                      this.changebgColor(this.color.gray);
                    }}
                    style={styles.colorSelection}
                  >
                    <View style={styles.color2}></View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessible={true}
                    onPress={() => {
                      this.changebgColor(this.color.ODgreen);
                    }}
                    style={styles.colorSelection}
                  >
                    <View style={styles.color3}></View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessible={true}
                    onPress={() => {
                      this.changebgColor(this.color.white);
                    }}
                    style={styles.colorSelection}
                  >
                    <View style={styles.color4}></View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Button
              title="Set Username"
              onPress={() =>
                this.props.navigation.navigate("Chat Screen", {
                  name: this.state.name,
                  bgColor: this.state.bgColor,
                })
              }
            />
          </View>
        </ImageBackground>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  titlebox: {
    height: "44%",
    width: "88%",
  },
  title: {
    fontSize: 45,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    padding: 20,
  },
  box: {
    marginBottom: 30,
    backgroundColor: "white",
    flexGrow: 1,
    flexShrink: 0,
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingTop: 15,
    paddingBottom: 15,
    borderRadius: 10,
    height: 260,
    minHeight: 260,
    maxHeight: 300,
    height: "44%",
    width: "88%",
  },
  inputBox: {
    flexDirection: "row",
    width: "88%",
    borderColor: "#757083",
    borderWidth: 1,
    padding: 10,
  },
  input: {
    fontSize: 16,
    fontWeight: "300",
    color: "#757083",
    opacity: 0.5,
  },
  colorBox: {
    flexDirection: "column",
    justifyContent: "center",
    padding: 20,
    marginRight: "auto",
    width: "88%",
  },
  colorText: {
    fontSize: 16,
    fontWeight: "300",
    color: "#757083",
    opacity: 1,
    padding: 5,
  },
  colorPalette: {
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 5,
  },
  colorSelection: {
    alignSelf: "center",
    flexDirection: "row",
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "white",
  },
  color1: {
    flexDirection: "column",
    backgroundColor: "#FF0000",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    margin: 2,
  },
  color2: {
    flexDirection: "row",
    backgroundColor: "#d3d3d3",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    margin: 2,
  },
  color3: {
    flexDirection: "row",
    backgroundColor: "#006400",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    margin: 2,
  },
  color4: {
    flexDirection: "row",
    backgroundColor: "#ffff",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    margin: 2,
  },
  button: {
    flexDirection: "column",
    backgroundColor: "#757083",
    width: "88%",
  },
  buttontext: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    padding: 20,
  },
});
