import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View, Dimensions, Modal, TouchableOpacity, Text
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import ImageViewer from 'react-native-image-zoom-viewer';
import MasonryList from "react-native-masonry-list";
import ImageSize from 'react-native-image-size';
import * as FileSystem from 'expo-file-system';
const phoneWidth = Dimensions.get("window").width;

const initState = [];
let page = 1;

export default function App() {

  const [list, setList] = useState(initState);
  const [visible, setVisible] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [index, setIndex] = useState(null);
  const listPhoto = list.map((item, index) => {
    return item.url_t;
  });
  const listUrl = listPhoto.map((item, index) => {

    return {
      url: item,
      width: Dimensions.get("window").width,
      height: 200
    }
  })
  const masonryUris = listPhoto.map((uri, index) => {
    const { width, height } = ImageSize.getSize(uri);

    const ratio = (phoneWidth / 2) / width;

    const newHeight = height / ratio;

    return {
      uri: uri,
      dimensions: {
        width: (phoneWidth / 2),
        height: newHeight
      }
    }
  })


  const onShowImage = (index) => {
    setVisible(!visible);
    setIndex(index)
  }
  const onSwipeDown = () => {
    setVisible(false);
  }
  const fetchData = () => {
    setRefresh(true);
    fetch('https://www.flickr.com/services/rest', {
      method: 'POST',
      body: new URLSearchParams({
        api_key: '865371b683a2ab8811362780c058828e',
        user_id: '187294171@N08',
        extras: 'views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o',
        format: 'json',
        method: 'flickr.favorites.getList',
        nojsoncallback: '1',
        per_page: 10,
        page: page,
      }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then(response => response.json())
      .then((json) => {
        setRefresh(false);
        page++;
        const data = [...list, ...json.photos.photo];
        setList(data)
      })
  }
  const onPressItem = (item, index) => {
    onShowImage(index);
  }
  const onSaveImage = async (currentIndex) => {

    const downloadResumable = FileSystem.createDownloadResumable(
      listPhoto[currentIndex],
      FileSystem.documentDirectory + 'small.jpg',
      {},
    );

    try {
      const { uri } = await downloadResumable.downloadAsync();
      MediaLibrary.saveToLibraryAsync(uri).then(() => {
        alert("tải ảnh thành công")
      })

      console.log('Finished downloading to ', uri);
    } catch (e) {
      console.error(e);
    }
  }
  useEffect(() => {

    fetchData();
  }, []);
  const onLoadMore = () => {
    if (refresh) {
      return;
    } else {
      console.log("poage", page);
      fetchData();
    }

  }
  console.log("log list data", list);
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <MasonryList
          images={masonryUris}
          onEndReached={onLoadMore}
          onEndReachedThreshold={8}
          numColumns={2}
          imageContainerStyle={{ borderRadius: 5, margin: 1 }}
          onPressImage={onPressItem}
        />

        <Modal visible={visible}>
          <ImageViewer
            enableSwipeDown
            onSwipeDown={onSwipeDown}
            index={index}
            renderFooter={(currentIndex) => {
              return <TouchableOpacity
                onPress={() => {
                  onSaveImage(currentIndex);
                }}
                style={{ justifyContent: "center", alignItems: "center", marginBottom: 50, marginLeft: phoneWidth - 60 }}>
                <Text style={{ color: "#FFF", fontWeight: "bold", alignSelf: "center" }}>Save</Text>
              </TouchableOpacity>
            }}
            imageUrls={listUrl} />
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
