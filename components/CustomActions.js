import React from "react";
import PropTypes from "prop-types";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker"; // Needed for selecting images and using camera
import * as Location from "expo-location"; // Needed for obtaining users geolocation
import firebase from "firebase";

export default class CustomActions extends React.Component {
  onActionPress = () => {
    // Function to bring up action sheet with communication features options
    const options = ["Select Image", "Send Photo", "Share Location", "Cancel"]; // Configures options
    const cancelButtonIndex = options.length - 1; // Identifes index of the cancel option
    this.context
      .actionSheet()
      .showActionSheetWithOptions(
        { options, cancelButtonIndex },
        async (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              console.log("user wants to pick an image");
              return this.pickImage();
            case 1:
              console.log("user wants to take a photo");
              return this.takePhoto();
            case 2:
              console.log("user wants to get their location");
              return this.getLocation();
            default:
          }
        }
      );
  };

  pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync(); // Requests users permission to access media library
      if (permissionResult.granted === true) {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "Images",
        }); // Allows user to select image
        if (result.cancelled === false) {
          const imageUrl = await this.getImageUrl(result.uri); // Obtains the Url of the image from Firebase storage
          this.props.onSend({ image: imageUrl }); // Passes the Url to the current message to populate the image property onSend via props. Once sent, image is visible inside message bubble
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  takePhoto = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const imagePermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraPermission.granted && imagePermission.granted === true) {
        // Both media library access permission and camera access permission needed
        const result = await ImagePicker.launchCameraAsync(); // Allows user to take photo and returns object with image uri. Rest of code works the same as for an image selected from the gallery
        if (result.cancelled === false) {
          const imageUrl = await this.getImageUrl(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync(); // Requests permission to retrieve user location
      if (status === "granted") {
        const result = await Location.getCurrentPositionAsync({}); // Returns user position
        const longitude = JSON.stringify(result.coords.longitude);
        const latitude = JSON.stringify(result.coords.latitude);
        if (result) {
          this.props.onSend({
            location: { longitude: longitude, latitude: latitude },
          }); // Updates the current message with the user location onSend via props. Once sent, location is displayed on a map inside the message bubble
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  getImageUrl = async (uri) => {
    try {
      const response = await fetch(uri); // Fetch the image from the local uri
      const blob = await response.blob(); // Convert to blob
      const splitUri = uri.split("/"); // Split the uri in to array of parts
      const imageName = splitUri[splitUri.length - 1]; // Select URL part
      const ref = firebase.storage().ref().child(`images/${imageName}`); // Create reference to where image will be stored in Firebase storage
      const storeBlob = await ref.put(blob); // Put blob in to storage
      return await storeBlob.ref.getDownloadURL(); // Retrieve URL of stored blob to attach to message when sent
    } catch (error) {
      console.log(error.message);
    }
  };

  render() {
    // Renders button that when pressed activates the action sheet, presenting the user with list of action to select from
    return (
      <TouchableOpacity
        style={styles.container}
        accessible={true}
        accessibilityLabel="More options"
        accessibilityHint="Launches menu with image, camera and location options"
        accessibilityRole="button"
        onPress={this.onActionPress}
      >
        <View style={[styles.wrapper, this.props.wrapperStyle]}>
          <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: "#b2b2b2",
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: "#b2b2b2",
    fontWeight: "bold",
    fontSize: 16,
    backgroundColor: "transparent",
    textAlign: "center",
  },
});

CustomActions.contextTypes = {
  // Assigns the context object actionSheet and checks that it is a function
  actionSheet: PropTypes.func,
};
