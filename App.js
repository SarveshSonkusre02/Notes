import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const App = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
  const [isPreviewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewNote, setPreviewNote] = useState('');

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const storedNotes = await AsyncStorage.getItem('notes');
        if (storedNotes !== null) {
          setNotes(JSON.parse(storedNotes));
        }
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    };

    // Load notes from AsyncStorage when the component mounts
    loadNotes();
  }, [setNotes]);

  const saveNotes = async (updatedNotes) => {
    try {
      await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const addOrUpdateNote = () => {
    const currentDate = new Date().toLocaleString();

    if (newNote.trim() !== '') {
      if (selectedNote !== null) {
        // Update existing note
        const updatedNotes = [...notes];
        updatedNotes[selectedNote] = {
          text: newNote,
          creationDateTime: updatedNotes[selectedNote].creationDateTime,
          lastEditDateTime: currentDate,
        };
        setNotes(updatedNotes);
        saveNotes(updatedNotes);
      } else {
        // Add new note
        const updatedNotes = [
          ...notes,
          {
            text: newNote,
            creationDateTime: currentDate,
            lastEditDateTime: null,
          },
        ];
        setNotes(updatedNotes);
        saveNotes(updatedNotes);
      }
      setNewNote('');
      setSelectedNote(null);
    }
  };

  const deleteNote = (index) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            const updatedNotes = [...notes];
            updatedNotes.splice(index, 1);
            setNotes(updatedNotes);
            setSelectedNote(null);
            saveNotes(updatedNotes);
          },
        },
      ],
      { cancelable: false }
    );
  };

  const openNote = (index, isEditButton) => {
    if (!isEditButton) {
      const noteText = notes[index].text || ''; // Extract text from the object
      setPreviewNote(noteText);
      setPreviewModalVisible(true);
    } else {
      setNewNote(notes[index].text || ''); // Extract text from the object
      setSelectedNote(index);
    }
  };

  const renderPreviewText = (note) => {
    // Display date time at the top of the preview
    const creationDateTimeText = `Created: ${note.creationDateTime}`;
    const lastEditDateTimeText = note.lastEditDateTime
      ? `Last Edited: ${note.lastEditDateTime}`
      : '';

    // Check if note.text is defined before splitting
    const lines = note.text ? note.text.split('\n') : [];

    // Display only the first two lines in the preview
    return `${creationDateTimeText}\n${lastEditDateTimeText}\n\n${lines
      .slice(0, 2)
      .join('\n')}`;
  };

  const openSettings = () => {
    // Show the settings modal
    setSettingsModalVisible(true);
  };

  const closeSettings = () => {
    // Close the settings modal
    setSettingsModalVisible(false);
  };

  const closePreviewModal = () => {
    setPreviewNote('');
    setPreviewModalVisible(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notes App</Text>
        <TouchableOpacity onPress={openSettings} style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.notesContainer}>
        {notes.map((note, index) => (
          <TouchableOpacity
            key={index}
            style={styles.noteCard}
            onPress={() => openNote(index, false)}>
            <Text style={styles.noteText}>{renderPreviewText(note)}</Text>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                onPress={() => deleteNote(index)}
                style={[styles.button, styles.deleteButtonStyle]}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openNote(index, true)}
                style={[styles.button, styles.editButtonStyle]}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your note here..."
          value={newNote}
          onChangeText={(text) => setNewNote(text)}
          multiline
        />
        <TouchableOpacity onPress={addOrUpdateNote} style={styles.addButton}>
          <Text style={styles.addButtonText}>
            {selectedNote !== null ? 'Update' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>

      {selectedNote !== null && (
        <TouchableOpacity
          onPress={() => deleteNote(selectedNote)}
          style={styles.deleteButtonStyle}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      )}

      {/* Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSettingsModalVisible}
        onRequestClose={closeSettings}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>App Version</Text>
            <Text style={styles.modalText}>2.0</Text>
            <Text style={styles.modalText}>Made by Sarvesh Sonkusre</Text>
            <TouchableOpacity
              onPress={closeSettings}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isPreviewModalVisible}
        onRequestClose={closePreviewModal}>
        <View style={styles.previewModalContainer}>
          <View style={styles.previewModalContent}>
            <Text style={styles.previewModalText}>{previewNote}</Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  notesContainer: {
    flex: 1,
    marginBottom: 20,
  },
  noteCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
  },
  noteText: {
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  editButtonStyle: {
    backgroundColor: 'orange',
    marginLeft: 5,
  },
  deleteButtonStyle: {
    backgroundColor: 'red',
    marginRight: 5,
  },
  buttonText: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    minHeight: 100,
  },
  addButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
  },
  deleteButtonStyle: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginRight: 5,
  },
  deleteButtonText: {
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'black',
  },
  previewModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  previewModalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  previewModalText: {
    fontSize: 16,
  },
});

export default App;
