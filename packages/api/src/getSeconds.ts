import getDatabase from "./getDatabase";
import { DatabaseStoryProps } from "./sharedTypes";
import logger from "./logger";

// Want 1 more as we always round down the number in ui
const defaultSeconds = 40 + 1;

function getSeconds(storyId: string): Promise<number> {
  return new Promise((resolve) => {
    const onError = (error: Error) => {
      logger.log("Error getting seconds from database", { error });
      resolve(defaultSeconds);
    };

    try {
      // TODO: Share all refs with frontend
      getDatabase()
        .ref(`/storiesById/${storyId}/storyProps`)
        .once(
          "value",
          (snapshot) => {
            // TODO: Cast as unknown and do the same stuff we do in frontend to validate.
            var data = snapshot.val() as undefined | DatabaseStoryProps;

            if (!data) {
              resolve(defaultSeconds);
              return;
            }

            resolve(data.secondsPerRound || defaultSeconds);
          },
          onError
        );
    } catch (error) {
      onError(error);
    }
  });
}

export default getSeconds;
