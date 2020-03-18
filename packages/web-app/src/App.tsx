import React from "react";
import cloneDeep from "lodash/cloneDeep";
import { v4 as uuid } from "uuid";
// import { useSubscription } from "@apollo/react-hooks";
// import { gql } from "apollo-boost";
import database from "./utils/database";
import "./App.css";

interface Entry {
  // authorId: string;
  // entries: string[];
  finalEntry: {
    text: string;
    paragraphs: string[];
  };
  offline?: boolean;
  // startDate: number;
  // endDate: number;
  id: string;
}

// const entries: Entry[] = [
//   {
//     finalEntry: {
//       text: "",
//       paragraphs: ["Hey girl.", "\n", "How you doing.", " Hey girl"]
//     },
//     id: "1"
//   },
//   {
//     finalEntry: {
//       text: "",
//       paragraphs: [
//         ". Where you going.",
//         "\n",
//         "Who's that girl.",
//         " Who's that girl."
//       ]
//     },
//     id: "2"
//   }
// ];

const timeout = 10;

function App() {
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const [currentEntry, setCurrentEntry] = React.useState<Entry | null>(null);
  const [entries, setEntries] = React.useState<Entry[]>([]);
  const [offlineEntries] = React.useState<Entry[]>([]);
  const [countDown, setCountDown] = React.useState(timeout);

  // const data = useSubscription(gql(``));

  // console.log("useSubscription", data);

  function focus() {
    if (!textAreaRef) return;
    if (!textAreaRef.current) return;

    textAreaRef.current.focus();
  }

  React.useEffect(() => {
    focus();

    const ref = "/entries";

    setInterval(() => {
      setCountDown(v => {
        if (v === 0) {
          // setOfflineEntries((e) => [...e, ])
          return timeout;
        }

        return v - 1;
      });
    }, 1000);

    database
      .ref(ref)
      .once("value")
      .then(snapshot => {
        const val = snapshot.val();

        if (!Array.isArray(val)) {
          return database
            .ref(ref)
            .set([])
            .then(() => []);
        }

        return val;
      })
      .then(setEntries);
  }, []);

  function handleOnChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const entry: Entry = currentEntry
      ? cloneDeep(currentEntry)
      : {
          finalEntry: {
            text: "",
            paragraphs: []
          },
          id: uuid()
        };

    const { value } = e.target;

    const start: string[] = [];

    entry.finalEntry.text = value;
    entry.finalEntry.paragraphs = entry.finalEntry.text
      .split("\n")
      .reduce((r, a, i) => {
        if (entry.finalEntry.paragraphs.length - 1 === i) return r.concat(a);

        return r.concat(a, "\n");
      }, start);

    setCurrentEntry(entry);
  }

  let finalEntries = [...entries, ...offlineEntries];
  finalEntries = currentEntry ? [...finalEntries, currentEntry] : finalEntries;

  return (
    <div className="App">
      {finalEntries.map(({ finalEntry: { paragraphs }, id }) => {
        return paragraphs.map((text, i) => {
          const key = `${id}-${i}`;

          if (text === "\n") return <br key={key} />;

          return <span key={key}>{text}</span>;
        });
      })}

      <p>{countDown}</p>

      <textarea
        style={{ opacity: 0, position: "absolute", left: "-1000%" }}
        ref={textAreaRef}
        value={currentEntry ? currentEntry.finalEntry.text : ""}
        onChange={handleOnChange}
      ></textarea>
    </div>
  );
}

export default App;
