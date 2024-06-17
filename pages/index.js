import { useSession, signIn, signOut } from "next-auth/react";

export default function Component() {
  const { data: session } = useSession();
  if (session) {
    console.log(session.user)
    console.log(session.token)
    return (
      <>
        <p>Signed in as {session.user.email} </p>
        <p>ID on Auth is {session.user.id} </p>
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}
