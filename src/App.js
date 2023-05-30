import React, { Component } from "react";
import ParticlesBg from "particles-bg";
import Navigation from "./components/Navigation/Navigation";
import Signin from "./components/Signin/Signin";
import Register from "./components/Register/Register";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";

import Rank from "./components/Rank/Rank";
// import Clarifai from "clarifai";
import "./App.css";

const returnClarifaiRequestOptions = (imageUrl) => {
  // Your PAT (Personal Access Token) can be found in the portal under Authentification
  const PAT = "a456e34fcff84269ae09e8ecd0a735d2";
  // Specify the correct user_id/app_id pairings
  // Since you're making inferences outside your app's scope
  const USER_ID = "8c138ijwlih9";
  const APP_ID = "my-first-application";
  // Change these to whatever model and image URL you want to use
  // const MODEL_ID = "face-detection";
  const IMAGE_URL = imageUrl;

  const raw = JSON.stringify({
    user_app_id: {
      user_id: USER_ID,
      app_id: APP_ID,
    },
    inputs: [
      {
        data: {
          image: {
            url: IMAGE_URL,
          },
        },
      },
    ],
  });

  const requestOptions = {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: "Key " + PAT,
    },
    body: raw,
  };

  return requestOptions;
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: "",
      imageUrl: "",
      box: {},
      route: "signin",
      isSignIn: false,
      user: {
        id: "",
        name: "",
        email: "",
        entries: 0,
        joined: "",
      },
    };
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById("inputImage");
    const width = Number(image.width);
    const height = Number(image.height);
    // console.log(width, height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  };

  displayFaceBox = (box) => {
    console.log("box", box);
    this.setState({ box: box });
  };

  onInputChange = (event) => {
    // console.log(event.target.value);
    this.setState({ input: event.target.value });
  };

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input });

    fetch(
      "https://api.clarifai.com/v2/models/" + "face-detection" + "/outputs",
      returnClarifaiRequestOptions(this.state.input)
    )
      .then((response) => response.json())
      .then((response) => {
        console.log("hi", response);
        this.displayFaceBox(this.calculateFaceLocation(response));

        // if (response) {
        //   fetch("http://localhost:3000/image", {
        //     method: "put",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({
        //       id: this.state.user.id,
        //     }),
        //   })
        //     .then((response) => {
        //       response.json();
        //     })
        //     .then((count) => {
        //       this.setState(Object.assign(this.state.user, { entries: count }));
        //     });
        // }
      })
      .catch((err) => console.log(err));
  };

  onRouteChange = (route) => {
    if (route === "signout") {
      this.setState({ isSignIn: false });
    } else if (route === "home") {
      this.setState({ isSignIn: true });
    }
    this.setState({ route: route });
  };

  render() {
    const {isSignIn, imageUrl, route, box} = this.state;
    return (
      <div className="App">
        <ParticlesBg color="#A463F2" type="cobweb" bg={true} />
        <Navigation isSignedIn={isSignIn} onRouteChange={this.onRouteChange} />
        {route === "home" ? (
          <div>
            <Logo />
            <Rank />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
            />
            <FaceRecognition
              box={box}
              imageUrl={imageUrl}
            />
          </div>
        ) : route === "signin" ? (
          <Signin onRouteChange={this.onRouteChange} />
        ) : (
          <Register onRouteChange={this.onRouteChange} />
        )}
      </div>
    );
  }
}

export default App;
