import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

const storyEntries = [
  {
    id: '2',
    author: 'Charlie',
    entryPartials: [
      {
        id: 'a',
        text:
          'Once upon a time there was a turkey called Rob.\nOne day Rob went to the toilet',
      },
    ],
  },
  {
    id: '1',
    author: 'Bob',
    entryPartials: [{ id: 'b', text: '.\nIn the toilet he did a piss' }],
  },
];

const nextEntryPartials = [
  {
    id: '3',
    author: 'Viki',
    entryPartials: [
      { id: 'c', text: ' ' },
      { id: 'd', text: ' a' },
      { id: 'e', text: ' an' },
      { id: 'f', text: ' and' },
      { id: 'g', text: ' and ' },
      { id: 'h', text: ' and p' },
      { id: 'i', text: ' and po' },
      { id: 'j', text: ' and poo' },
      { id: 'k', text: ' and pooe' },
      { id: 'l', text: ' and pooed' },
      { id: 'm', text: ' and pooed.' },
    ],
  },
  {
    id: '4',
    author: 'Viki',
    entryPartials: [
      { id: 'n', text: '\n' },
      { id: 'o', text: '\nW' },
      { id: 'p', text: '\nWh' },
      { id: 'q', text: '\nWhe' },
      { id: 'r', text: '\nWhen' },
      { id: 's', text: '\nWhen ' },
      { id: 't', text: '\nWhen h' },
      { id: 'u', text: '\nWhen he' },
      { id: 'v', text: '\nWhen h' },
      { id: 'w', text: '\nWhen hi' },
      { id: 'x', text: '\nWhen his' },
    ],
  },
];

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
    this.hasNextEntryPartials = this.hasNextEntryPartials.bind(this);

    let storyParagraphs = [];

    storyEntries.forEach(({ author, entryPartials }) => {
      const { text, id } = entryPartials[entryPartials.length - 1];

      storyParagraphs = this.addEntryTextToStoryParagraphs(
        text,
        storyParagraphs,
        id,
      );
    });

    this.prevStoryParagraphs = storyParagraphs;
    this.nextEntryPartials = nextEntryPartials;

    this.state = {
      storyParagraphs,
      hasNextEntryPartials: this.hasNextEntryPartials(),
      playing: false,
    };
  }

  clearPlay() {
    this.setState({ playing: false });
    clearInterval(this.interval);
  }

  play() {
    if (this.nextEntryPartials.length) {
      this.setState({ playing: true });

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
    if (!this.state.hasNextEntryPartials) {
      this.clearPlay();
      return;
    }

    const { text, id } = this.nextEntryPartials[0].entryPartials[0];

    const nextStoryParagraphs = this.addEntryTextToStoryParagraphs(
      text,
      this.prevStoryParagraphs,
      id,
    );

    if (this.nextEntryPartials[0].entryPartials.length === 1) {
      this.prevStoryParagraphs = nextStoryParagraphs;
      this.nextEntryPartials = this.nextEntryPartials.slice(1);
    } else {
      this.nextEntryPartials[0].entryPartials = this.nextEntryPartials[0].entryPartials.slice(
        1,
      );
    }

    this.setState({
      storyParagraphs: nextStoryParagraphs,
      hasNextEntryPartials: this.hasNextEntryPartials(),
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

  hasNextEntryPartials() {
    return (
      this.nextEntryPartials.length &&
      this.nextEntryPartials[0].entryPartials.length
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <View>
          {this.state.storyParagraphs.map(({ text, id }) => (
            <Text key={id}>{text}</Text>
          ))}
        </View>
        {this.state.hasNextEntryPartials &&
          !this.state.playing && (
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
