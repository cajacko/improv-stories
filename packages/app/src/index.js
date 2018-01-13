import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

const storyEntries = [
  {
    author: 'Bob',
    finalEntryText: '.\nIn the toilet he did a piss',
  },
  {
    author: 'Charlie',
    finalEntryText:
      'Once upon a time there was a turkey called Rob.\nOne day Rob went to the toilet',
  },
];

const nextEntryPartials = [
  {
    author: 'Viki',
    entryPartials: [
      ' ',
      ' a',
      ' an',
      ' and',
      ' and ',
      ' and p',
      ' and po',
      ' and poo',
      ' and pooe',
      ' and pooed',
      ' and pooed.',
    ],
  },
  {
    author: 'Viki',
    entryPartials: [
      '\n',
      '\nW',
      '\nWh',
      '\nWhe',
      '\nWhen',
      '\nWhen ',
      '\nWhen h',
      '\nWhen he',
      '\nWhen h',
      '\nWhen hi',
      '\nWhen his',
    ],
  },
];

export default class App extends React.Component {
  constructor(props) {
    super(props);

    let storyText = '';

    storyEntries.forEach(({ author, finalEntryText }) => {
      storyText = `${finalEntryText}${storyText}`;
    });

    this.playing = false;

    const storyParagraphs = storyText.split('\n');
    this.prevStoryParagraphs = storyParagraphs;
    this.nextEntryPartials = nextEntryPartials;

    this.state = { storyParagraphs };

    this.play = this.play.bind(this);
    this.clearPlay = this.clearPlay.bind(this);
    this.addNextEntryPartialToStoryParagraphs = this.addNextEntryPartialToStoryParagraphs.bind(
      this,
    );
    this.addEntryTextToStoryParagraphs = this.addEntryTextToStoryParagraphs.bind(
      this,
    );
  }

  clearPlay() {
    this.playing = false;
    clearInterval(this.interval);
  }

  play() {
    if (this.nextEntryPartials.length) {
      this.playing = true;
      this.interval = setInterval(() => {
        if (this.nextEntryPartials.length) {
          this.addNextEntryPartialToStoryParagraphs();
        } else {
          this.clearPlay();
        }
      }, 100);
    }
  }

  addNextEntryPartialToStoryParagraphs() {
    if (
      !this.nextEntryPartials.length ||
      !this.nextEntryPartials[0].entryPartials.length
    ) {
      this.clearPlay();
      return;
    }

    const entryPartialToAdd = this.nextEntryPartials[0].entryPartials[0];

    const nextStoryParagraphs = this.addEntryTextToStoryParagraphs(
      entryPartialToAdd,
      this.prevStoryParagraphs,
    );

    this.setState({ storyParagraphs: nextStoryParagraphs });

    if (this.nextEntryPartials[0].entryPartials.length === 1) {
      this.prevStoryParagraphs = nextStoryParagraphs;
      this.nextEntryPartials = this.nextEntryPartials.slice(1);
    } else {
      this.nextEntryPartials[0].entryPartials = this.nextEntryPartials[0].entryPartials.slice(
        1,
      );
    }
  }

  addEntryTextToStoryParagraphs(entryText, storyParagraphs) {
    let entryParagraphs = entryText.split('\n');

    if (!entryParagraphs.length) return storyParagraphs;

    let nextStoryParagraphs = storyParagraphs.slice();
    const lastStoryParagraphIndex = nextStoryParagraphs.length - 1;
    const lastStoryParagraph = nextStoryParagraphs[lastStoryParagraphIndex];

    nextStoryParagraphs[lastStoryParagraphIndex] = `${lastStoryParagraph}${
      entryParagraphs[0]
    }`;
    entryParagraphs = entryParagraphs.slice(1);

    nextStoryParagraphs = nextStoryParagraphs.concat(entryParagraphs);
    return nextStoryParagraphs;
  }

  render() {
    return (
      <View style={styles.container}>
        <View>
          {this.state.storyParagraphs.map((text, i) => (
            <Text key={`${i}-${text}`}>{text}</Text>
          ))}
        </View>
        <TouchableOpacity onPress={this.play}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Play</Text>
          </View>
        </TouchableOpacity>
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
