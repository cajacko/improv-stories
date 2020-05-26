import { v4 as uuid } from "uuid";
import { ClientMessage, ServerMessage } from "../sharedTypes";
import {
  __TESTS__setGetDatabase as setDatabase,
  __TESTS__reset as resetDatabase,
} from "../getDatabase";
import {
  __TESTS__reset as resetStore,
  __TESTS__getStore as getStore,
  __TESTS__setGetDate as setGetDate,
  __TESTS__setGetId as setGetId,
} from "../store";
import { __TESTS__setGetRand as setGetRand } from "../getRand";

import setupSockets from "../setupSockets";

jest.useFakeTimers();

function connectUserAndGetFuncs(userId: string) {
  let sendClientMessage: (
    message: Omit<ClientMessage, "id" | "createdAt">
  ) => Promise<any>;
  let disconnect: () => {};

  const sendMock = jest.fn<unknown, [ServerMessage]>();

  const sock: any = {
    // NOTE: Keep this as we use to use this for the id, but now don't and want to ensure it doesn't
    // ruin anything
    id: uuid(),
    request: {
      _query: {
        user_id: userId,
      },
    },
    on: (type: any, callback: any) => {
      if (type === "disconnect") {
        disconnect = callback;
      } else {
        sendClientMessage = callback;
      }
    },
    send: sendMock,
  };

  let connectUser: any;

  const io: any = {
    on: (type: any, callback: any) => {
      connectUser = callback;
    },
  };

  setupSockets(io);

  connectUser(sock);

  return {
    // @ts-ignore
    sendClientMessage,
    // @ts-ignore
    disconnect,
    sendMock,
  };
}

type Funcs = ReturnType<typeof connectUserAndGetFuncs>;

const resetDateValue = new Date(2020, 1, 1, 0, 0, 0, 0);

function getUserSendCall(
  user: Funcs,
  callNumber: number,
  doNotAsset = false
): ServerMessage {
  const call = user.sendMock.mock.calls[callNumber - 1];

  if (!doNotAsset) {
    expect(!!call).toBe(true);
  }

  return call[0];
}

function getUserSendCallFromEnd(
  user: Funcs,
  callFromEndNumber: number = 0,
  doNotAsset = false
): ServerMessage {
  const callNumber = user.sendMock.mock.calls.length - callFromEndNumber;

  return getUserSendCall(user, callNumber, doNotAsset);
}

function getLastUserSendCall(user: Funcs, doNotAsset = false): ServerMessage {
  return getUserSendCallFromEnd(user, 0, doNotAsset);
}

function expectUserSendCount(user: Funcs, count: number) {
  expect(user.sendMock.mock.calls.length).toBe(count);
}

function expectSameUserSentMessagesFromEnd(
  users: Funcs[],
  callFromEndNumber: number = 0,
  doNotAsset = false
) {
  expect(users.length > 1).toBe(true);

  const firstCall = getUserSendCallFromEnd(
    users[0],
    callFromEndNumber,
    doNotAsset
  );

  users.forEach((user) => {
    expect(firstCall.payload).toEqual(
      getUserSendCallFromEnd(user, callFromEndNumber, doNotAsset).payload
    );

    expect(firstCall.type).toEqual(
      getUserSendCallFromEnd(user, callFromEndNumber, doNotAsset).type
    );
  });
}

function expectSameUserLastSentMessages(users: Funcs[], doNotAsset = false) {
  return expectSameUserSentMessagesFromEnd(users, 0, doNotAsset);
}

beforeEach(() => {
  resetStore();
  resetDatabase();

  setDatabase(() => ({
    ref: () => ({
      push: () => Promise.resolve(),
      once: (type: string, callback: any) => callback({ val: () => undefined }),
    }),
  }));

  const date = new Date(resetDateValue);

  setGetDate(() => {
    date.setMinutes(date.getMinutes() + 1);
    return date.toISOString();
  });

  let id = 0;

  setGetId(() => {
    id += 1;
    return `${id}`;
  });

  let rand = 1;

  setGetRand(() => {
    rand += 1;
    if (rand >= 10) rand = 1;

    return rand / 10;
  });
});

afterEach(() => {
  jest.clearAllTimers();
});

describe("user1 connects", () => {
  const user1Id = "user1";
  let user1: Funcs;

  beforeEach(() => {
    user1 = connectUserAndGetFuncs(user1Id);
  });

  afterEach(() => {
    if (user1) {
      user1.disconnect();
    }
  });

  describe("user1 added to story1", () => {
    const story1Id = "story1";

    beforeEach(() => {
      user1.sendClientMessage({
        type: "LIVE_STORY_ADD_USER_TO_STORY",
        payload: {
          storyId: story1Id,
        },
      });
    });

    it("Broadcasts the correct changes to user1", () => {
      expect(getLastUserSendCall(user1)).toMatchSnapshot();
    });

    it("the user1 broadcast count is 1", () => {
      expectUserSendCount(user1, 1);
    });

    describe("user2 connects", () => {
      const user2Id = "user2";
      let user2: Funcs;

      beforeEach(() => {
        user2 = connectUserAndGetFuncs(user2Id);
      });

      afterEach(() => {
        if (user2) {
          user2.disconnect();
        }
      });

      describe("user2 added to story1", () => {
        beforeEach(() => {
          user2.sendClientMessage({
            type: "LIVE_STORY_ADD_USER_TO_STORY",
            payload: {
              storyId: story1Id,
            },
          });
        });

        it("Broadcasts the correct changes to user2", () => {
          expect(getLastUserSendCall(user2)).toMatchSnapshot();
        });

        it("the user2 broadcast count is 1", () => {
          expectUserSendCount(user2, 1);
        });

        it("Broadcasts the same changes to user1", () => {
          expectSameUserLastSentMessages([user1, user2]);
        });

        it("the user1 broadcast count is 2", () => {
          expectUserSendCount(user1, 2);
        });

        describe("user1 disconnects", () => {
          beforeEach(() => {
            user1.disconnect();
          });

          it("Broadcasts the correct changes to user2", () => {
            expect(getLastUserSendCall(user2)).toMatchSnapshot();
          });

          it("the user2 broadcast count is 2", () => {
            expectUserSendCount(user2, 2);
          });

          describe("user1 connects", () => {
            beforeEach(() => {
              user1 = connectUserAndGetFuncs(user1Id);
            });

            afterEach(() => {
              if (user1) {
                user1.disconnect();
              }
            });

            describe("user1 added to story1", () => {
              const story1Id = "story1";

              beforeEach(() => {
                user1.sendClientMessage({
                  type: "LIVE_STORY_ADD_USER_TO_STORY",
                  payload: {
                    storyId: story1Id,
                  },
                });
              });

              it("Broadcasts the correct changes to user1", () => {
                expect(getLastUserSendCall(user1)).toMatchSnapshot();
              });

              it("the user1 broadcast count is 1", () => {
                expectUserSendCount(user1, 1);
              });

              it("Broadcasts the same changes to user2", () => {
                expectSameUserLastSentMessages([user1, user2]);
              });

              it("the user2 broadcast count is 3", () => {
                expectUserSendCount(user2, 3);
              });
            });
          });
        });

        describe("user1 becomes active on story1", () => {
          beforeEach(() => {
            user1.sendClientMessage({
              type: "LIVE_STORY_ADD_ACTIVE_USER_TO_STORY",
              payload: {
                storyId: story1Id,
              },
            });
          });

          it("Broadcasts the correct changes to user2", () => {
            expect(getLastUserSendCall(user2)).toMatchSnapshot();
          });

          it("the user2 broadcast count is 2", () => {
            expectUserSendCount(user2, 2);
          });

          it("Broadcasts the same changes to user1", () => {
            expectSameUserLastSentMessages([user1, user2]);
          });

          it("the user1 broadcast count is 3", () => {
            expectUserSendCount(user1, 3);
          });

          describe("user2 becomes active on story1", () => {
            beforeEach(() => {
              user2.sendClientMessage({
                type: "LIVE_STORY_ADD_ACTIVE_USER_TO_STORY",
                payload: {
                  storyId: story1Id,
                },
              });
            });

            it("Broadcasts the correct changes to user2", () => {
              expect(getUserSendCallFromEnd(user2, 1)).toMatchSnapshot();
              expect(getLastUserSendCall(user2)).toMatchSnapshot();
            });

            it("the user2 broadcast count is 4", () => {
              expectUserSendCount(user2, 4);
            });

            it("Broadcasts the same changes to user1", () => {
              expectSameUserLastSentMessages([user1, user2]);
              expectSameUserSentMessagesFromEnd([user1, user2], 1);
            });

            it("the user1 broadcast count is 5", () => {
              expectUserSendCount(user1, 5);
            });

            it("user1 is the active user", () => {
              const message = getLastUserSendCall(user2);

              if (message.type !== "LIVE_STORY_STORY_CHANGED") {
                throw new Error("Expected message type to be STORY_CHANGED");
              }

              if (!message.payload.activeSession) {
                throw new Error(
                  "Expected the message payload to have activeSession"
                );
              }

              expect(message.payload.activeSession.user.id).toBe("user1");
            });

            describe("user1 sets text", () => {
              beforeEach(() => {
                user1.sendClientMessage({
                  type: "LIVE_STORY_SET_SESSION_TEXT",
                  payload: {
                    text: "a",
                    storyId: story1Id,
                  },
                });
              });

              it("Broadcasts the correct changes to user2", () => {
                expect(getLastUserSendCall(user2)).toMatchSnapshot();
              });

              it("the user2 broadcast count is 5", () => {
                expectUserSendCount(user2, 5);
              });

              it("Broadcasts the same changes to user1", () => {
                expectSameUserLastSentMessages([user1, user2]);
                expectSameUserSentMessagesFromEnd([user1, user2], 1);
              });

              it("the user1 broadcast count is 6", () => {
                expectUserSendCount(user1, 6);
              });

              // TODO: Test session elapsing, saving to db and switching users here
              // TODO: Test setting session as done

              describe("user1 ends the session early", () => {
                beforeEach(() => {
                  return user1.sendClientMessage({
                    type: "LIVE_STORY_SET_SESSION_DONE",
                    payload: {
                      sessionId: "8",
                      storyId: story1Id,
                    },
                  });
                });

                it("Broadcasts the correct changes to user2", () => {
                  expect(getLastUserSendCall(user2)).toMatchSnapshot();
                });

                it("the user2 broadcast count is 6", () => {
                  expectUserSendCount(user2, 6);
                });

                it("Broadcasts the same changes to user1", () => {
                  expectSameUserLastSentMessages([user1, user2]);
                  expectSameUserSentMessagesFromEnd([user1, user2], 1);
                });

                it("the user1 broadcast count is 7", () => {
                  expectUserSendCount(user1, 7);
                });

                // TODO: Check db saved, user id change is correct
              });
            });

            describe("user1 disconnects", () => {
              beforeEach(() => {
                user1.disconnect();
              });

              it("Broadcasts the correct changes to user2", () => {
                expect(getLastUserSendCall(user2)).toMatchSnapshot();
              });

              it("the user2 broadcast count is 5", () => {
                expectUserSendCount(user2, 5);
              });

              it("the active session is the same as before", () => {
                const message1 = getLastUserSendCall(user1);
                const message2 = getLastUserSendCall(user2);

                if (message1.type !== "LIVE_STORY_STORY_CHANGED") {
                  throw new Error("Expected message type to be STORY_CHANGED");
                }

                if (!message1.payload.activeSession) {
                  throw new Error(
                    "Expected the message payload to have activeSession"
                  );
                }

                if (message2.type !== "LIVE_STORY_STORY_CHANGED") {
                  throw new Error("Expected message type to be STORY_CHANGED");
                }

                if (!message2.payload.activeSession) {
                  throw new Error(
                    "Expected the message payload to have activeSession"
                  );
                }

                expect(message1.payload.activeSession.id).toEqual(
                  message2.payload.activeSession.id
                );
              });
            });

            describe("user2 disconnects", () => {
              beforeEach(() => {
                user2.disconnect();
              });

              it("Broadcasts the correct changes to user1", () => {
                expect(getLastUserSendCall(user1)).toMatchSnapshot();
              });

              it("the user1 broadcast count is 6", () => {
                expectUserSendCount(user1, 6);
              });

              it("the active session is the same as before", () => {
                const message1 = getLastUserSendCall(user1);
                const message2 = getLastUserSendCall(user2);

                if (message1.type !== "LIVE_STORY_STORY_CHANGED") {
                  throw new Error("Expected message type to be STORY_CHANGED");
                }

                if (!message1.payload.activeSession) {
                  throw new Error(
                    "Expected the message payload to have activeSession"
                  );
                }

                if (message2.type !== "LIVE_STORY_STORY_CHANGED") {
                  throw new Error("Expected message type to be STORY_CHANGED");
                }

                if (!message2.payload.activeSession) {
                  throw new Error(
                    "Expected the message payload to have activeSession"
                  );
                }

                expect(message1.payload.activeSession.id).toEqual(
                  message2.payload.activeSession.id
                );
              });
            });
          });
        });
      });
    });
  });
});
