import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { IconButton } from 'react-native-paper';

type Props = {
  imgSource: string;
  selectedImage?: string;
  onEditPress?: () => void;
};

export default function ImageViewer({ imgSource, selectedImage, onEditPress }: Props) {
  const imageSource = selectedImage || imgSource;

  return (
    <TouchableOpacity style={styles.container} onPress={onEditPress}>
      <Image source={{ uri: imageSource }} style={styles.image} />
      <IconButton icon="pencil" iconColor="#fff" size={16} style={styles.editIcon} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
    marginTop: 20,
    width: 120,
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  editIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#80C4E9',
  },
});