import React, { Component } from "react";
import { FlatList, View, Platform, TouchableOpacity } from "react-native";
import { MonoText } from "../components/StyledText";
const result = require("./waste.json");
import { Constants, Location, Permissions } from "expo";

function distance(lat1, lon1, lat2, lon2, unit) {
  var radlat1 = (Math.PI * lat1) / 180;
  var radlat2 = (Math.PI * lat2) / 180;
  var theta = lon1 - lon2;
  var radtheta = (Math.PI * theta) / 180;
  var dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  if (unit == "K") {
    dist = dist * 1.609344;
  }
  if (unit == "N") {
    dist = dist * 0.8684;
  }
  return dist;
}

export default class SearchPage extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: `${navigation.getParam("type")} - ${navigation
        .getParam("district")
        .replace(/_/gi, " ")}`,
      headerStyle: {
        backgroundColor: "#2EBCD0"
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold",
        fontFamily: "space-mono"
      }
    };
  };
  state = {
    location: null,
    errorMessage: null
  };

  componentWillMount() {
    if (Platform.OS === "android" && !Constants.isDevice) {
      this.setState({
        errorMessage:
          "Oops, this will not work on Sketch in an Android emulator. Try it on your device!"
      });
    } else {
      this._getLocationAsync();
    }
  }
  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      this.setState({
        errorMessage: "Permission to access location was denied"
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location });
  };
  _render = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        this.props.navigation.navigate("Map", {
          latitude: item.lat,
          longitude: item.lgt,
          title: item.address_tc
        })
      }
    >
      <View paddingVertical={16} paddingHorizontal={32} position="relative">
        <View width="80%" flexDirection="column">
          <MonoText style={{ color: "#2EBCD0", fontSize: 24 }}>
            {item.address_tc}
          </MonoText>
          <MonoText>{item.address_en}</MonoText>
        </View>
        {!!this.state.location && (
          <View position="absolute" right={16} bottom={8}>
            <MonoText style={{ color: "#2EBCD0" }}>
              {distance(
                item.lat,
                item.lgt,
                this.state.location.coords.latitude,
                this.state.location.coords.longitude,
                "K"
              ).toFixed(2)}
              KM
            </MonoText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
  render() {
    let res = result;
    const type = this.props.navigation.getParam("type");
    if (type && type !== "Any") {
      res = res.filter(i => i.waste_type.includes(type));
    }
    // console.log({res});
    return (
      <View flex={1} backgroundColor="white">
        <FlatList
          initialNumToRender={20}
          data={res}
          renderItem={this._render}
          keyExtractor={i => `${i.cp_id}`}
          ItemSeparatorComponent={() => (
            <View
              marginLeft={32}
              height={1}
              width="100%"
              backgroundColor="#2EBCD0"
            />
          )}
        />
        {/* <MonoText>{res.length}</MonoText> */}
        {/* <MonoText>{JSON.stringify(this.state.location)}</MonoText> */}
      </View>
    );
  }
}
