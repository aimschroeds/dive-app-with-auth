import React from 'react';
import { SafeAreaView, StyleSheet, TextInput } from 'react-native';

const TextDetailsInput = () => {
  const [text, onChangeText] = React.useState('');

  return (
    <SafeAreaView>
      <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={text}
        placeholder="useless placeholder"
        placeholderTextColor={'white'}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 30,
    margin: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#413FEB',
    color: 'white',
  },
});

export default TextDetailsInput;