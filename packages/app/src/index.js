import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import state from './state';

const { prevEntries, nextEntries, authors } = state;

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.play = this.play.bind(this);
    this.clearPlay = this.clearPlay.bind(this);
    this.addNextEntryPartialToStoryParagraphs = this.addNextEntryPartialToStoryParagraphs.bind(
      this,
    );
    this.addEntryTextToStoryParagraphs = this.addEntryTextToStoryParagraphs.bind(
      this,
    );
    this.hasNextEntries = this.hasNextEntries.bind(this);

    let storyParagraphs = [];

    prevEntries.forEach(({ author, entryPartials }) => {
      const { text, id } = entryPartials[entryPartials.length - 1];

      storyParagraphs = this.addEntryTextToStoryParagraphs(
        text,
        storyParagraphs,
        id,
      );
    });

    this.prevStoryParagraphs = storyParagraphs;
    this.nextEntries = nextEntries;

    this.state = {
      storyParagraphs,
      hasNextEntries: this.hasNextEntries(),
      playing: false,
    };
  }

  clearPlay() {
    this.setState({ playing: false });
    clearInterval(this.interval);
  }

  play() {
    if (this.nextEntries.length) {
      this.setState({ playing: true });

      this.interval = setInterval(() => {
        if (this.nextEntries.length) {
          this.addNextEntryPartialToStoryParagraphs();
        } else {
          this.clearPlay();
        }
      }, 100);
    }
  }

  addNextEntryPartialToStoryParagraphs() {
    if (!this.state.hasNextEntries) {
      this.clearPlay();
      return;
    }

    const { text, id } = this.nextEntries[0].entryPartials[0];

    const nextStoryParagraphs = this.addEntryTextToStoryParagraphs(
      text,
      this.prevStoryParagraphs,
      id,
    );

    if (this.nextEntries[0].entryPartials.length === 1) {
      this.prevStoryParagraphs = nextStoryParagraphs;
      this.nextEntries = this.nextEntries.slice(1);
    } else {
      this.nextEntries[0].entryPartials = this.nextEntries[0].entryPartials.slice(
        1,
      );
    }

    this.setState({
      storyParagraphs: nextStoryParagraphs,
      hasNextEntries: this.hasNextEntries(),
    });
  }

  addEntryTextToStoryParagraphs(entryText, storyParagraphs, id) {
    let entryParagraphs = entryText.split('\n');

    if (!entryParagraphs.length) return storyParagraphs;

    entryParagraphs = entryParagraphs.map((text, i) => ({
      text,
      id: `${id}-text`,
    }));

    let nextStoryParagraphs = storyParagraphs.slice();

    if (nextStoryParagraphs.length) {
      const lastStoryParagraphIndex = nextStoryParagraphs.length - 1;
      const lastStoryParagraph = nextStoryParagraphs[lastStoryParagraphIndex];
      const firstEntryParagraph = entryParagraphs[0];

      nextStoryParagraphs[lastStoryParagraphIndex] = {
        text: `${lastStoryParagraph.text}${firstEntryParagraph.text}`,
        id: `${lastStoryParagraph.id}-${firstEntryParagraph.id}`,
      };

      entryParagraphs = entryParagraphs.slice(1);
    }

    nextStoryParagraphs = nextStoryParagraphs.concat(entryParagraphs);
    return nextStoryParagraphs;
  }

  hasNextEntries() {
    return (
      !!this.nextEntries.length && !!this.nextEntries[0].entryPartials.length
    );
  }

  render() {
    const showButton = this.state.hasNextEntries && !this.state.playing;

    return (
      <View style={styles.container}>
        <View>
          {this.state.storyParagraphs.map(({ text, id }) => (
            <Text key={id}>{text}</Text>
          ))}
        </View>
        {showButton && (
          <TouchableOpacity onPress={this.play}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Play</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  button: {
    padding: 10,
    backgroundColor: 'blue',
    marginTop: 20,
  },

  buttonText: {
    color: 'white',
  },
});
