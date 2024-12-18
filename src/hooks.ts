import { useAtom } from "jotai";
import { atomWithImmer } from "jotai-immer";

const loggedInUserAtom = atomWithImmer<boolean>(false);
const userNameAtom = atomWithImmer<string>("");
const userEmailAtom = atomWithImmer<string>("");

export function useHook() {
  const [loggedInUser, setLoggedInUser] = useAtom(loggedInUserAtom);
  const [userName, setUserName] = useAtom(userNameAtom);
  const [userEmail, setUserEmail] = useAtom(userEmailAtom);

  return {
    loggedInUser,
    setLoggedInUser,
    userName,
    setUserName,
    userEmail,
    setUserEmail,
  };
}
