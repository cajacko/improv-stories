import { ClientMessage } from "../sharedTypes";
import {
  __TESTS__reset as reset,
  __TESTS__getStore as getStore,
  __TESTS__setGetDate as setGetDate,
  __TESTS__setGetId as setGetId,
} from "../store";

import setupSockets from "../setupSockets";

function connectUserAndGetFuncs(userId: string) {
  let sendClientMessage: (
    message: Omit<ClientMessage, "id" | "createdAt">
  ) => void;
  let disconnect: () => {};

  const sendMock = jest.fn();

  const sock: any = {
    id: userId,
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

beforeEach(() => {
  reset();

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
});

describe("user1 connects", () => {
  const user1Id = "user1";
  let user1: Funcs;

  beforeEach(() => {
    user1 = connectUserAndGetFuncs(user1Id);
  });

  describe("user1 added to story1", () => {
    const story1Id = "story1";

    beforeEach(() => {
      user1.sendClientMessage({
        type: "ADD_USER_TO_STORY",
        payload: {
          storyId: story1Id,
        },
      });
    });

    it("Broadcasts the correct changes to user1", () => {
      expect(user1.sendMock.mock.calls[0][0]).toMatchSnapshot();
    });

    it("the user1 broadcast count is 1", () => {
      expect(user1.sendMock.mock.calls.length).toBe(1);
    });

    describe("user2 connects", () => {
      const user2Id = "user2";
      let user2: Funcs;

      beforeEach(() => {
        user2 = connectUserAndGetFuncs(user2Id);
      });

      describe("user2 added to story1", () => {
        beforeEach(() => {
          user2.sendClientMessage({
            type: "ADD_USER_TO_STORY",
            payload: {
              storyId: story1Id,
            },
          });
        });

        it("Broadcasts the correct changes to user2", () => {
          expect(user2.sendMock.mock.calls[0][0]).toMatchSnapshot();
        });

        it("Calls the store correctly", () => {
          expect(getStore()).toMatchSnapshot();
        });

        it("the user2 broadcast count is 1", () => {
          expect(user2.sendMock.mock.calls.length).toBe(1);
        });

        it("Broadcasts the same changes to user1", () => {
          expect(user1.sendMock.mock.calls[1][0].payload).toEqual(
            user2.sendMock.mock.calls[0][0].payload
          );
        });

        it("the user1 broadcast count is 2", () => {
          expect(user1.sendMock.mock.calls.length).toBe(2);
        });
      });
    });
  });
});
