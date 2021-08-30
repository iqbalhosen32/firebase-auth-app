import logo from './logo.svg';
import './App.css';
import firebaseConfig from './firebase.config';
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, FacebookAuthProvider, getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { useState } from 'react';

const app = initializeApp(firebaseConfig);

function App() {
  const googleProvider = new GoogleAuthProvider();
  const fbProvider = new FacebookAuthProvider();
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignIn: false,
    name: '',
    email: '',
    password: '',
    photo: '',
    error: false,
    success: false
  })
  

  const handleSignIn = () => {
    const auth = getAuth();
    signInWithPopup(auth, googleProvider)
      .then(res => {
        const { displayName, email, photoURL } = res.user;
        const signedIn = {
          isSignIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setUser(signedIn)
        // console.log(displayName, email, photoURL)
      })
      .catch(err => {
        console.log(err)
        console.log(err.massage)
      })
  }
  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth).then(res => {
      // Sign-out successful.
      const isSignOut = {
        isSignIn: false,
        name: '',
        email: '',
        photo: ''
      }
      setUser(isSignOut)
    }).catch((error) => {
      // An error happened.
    });
  }

  const handleFbSignIn = () => {
    const auth = getAuth();
    signInWithPopup(auth, fbProvider)
      .then(result => {
        // The signed-in user info.
        // const user = result.user;

        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        const credential = FacebookAuthProvider.credentialFromResult(result);
        const accessToken = credential.accessToken;
        console.log('fb user', result)
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = FacebookAuthProvider.credentialFromError(error);

        // ...
      });
  }

  const handleBlur = event => {
    // console.log(event.target.name, event.target.value)
    let isFormValid;
    if (event.target.name === 'email') {
      isFormValid = /\S+@\S+\.\S+/.test(event.target.value)
    }
    if (event.target.name === 'password') {
      const isPasswordValid = event.target.value.length >= 6;
      const numberValid = /(?=.*[0-9])/.test(event.target.value)
      isFormValid = isPasswordValid && numberValid;
    }
    if (event.target.name === 'name') {
      isFormValid = event.target.value;
    }
    if (isFormValid) {
      const newUserInfo = { ...user }
      newUserInfo[event.target.name] = event.target.value;
      setUser(newUserInfo);
    }
  }
  const handleSubmit = (event) => {
    if (newUser && user.email && user.password) {
      console.log(user)
      const auth = getAuth();
      createUserWithEmailAndPassword(auth, user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user }
          newUserInfo.error = false;
          newUserInfo.success = true;
          setUser(newUserInfo)
          updateUserName(user.name)
        })
        .catch(error => {
          const newUserInfo = { ...user }
          newUserInfo.error = true;
          newUserInfo.success = false;
          setUser(newUserInfo)
          // ..
        });
    }
    if (!newUser && user.email && user.password) {
      const auth = getAuth();
      signInWithEmailAndPassword(auth, user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user }
          newUserInfo.error = false;
          newUserInfo.success = true;
          setUser(newUserInfo)
          console.log('sign in user info', res.user)
        })
        .catch(error => {
          const newUserInfo = { ...user }
          newUserInfo.error = true;
          newUserInfo.success = false;
          setUser(newUserInfo)
          // ..
        });
    }
    event.preventDefault();
  }
  const updateUserName = name => {
    const auth = getAuth();
    updateProfile(auth.currentUser, {
      displayName: name
    }).then(() => {
      console.log('user update successfully')
    }).catch((error) => {
      console.log(error)
    });
  }
  return (
    <div className="App">
      {
        user.isSignIn ? <button onClick={handleSignOut}>Sign out</button> : <button onClick={handleSignIn}>Sign in</button>
      }
      <br />
      <button onClick={handleFbSignIn}>Sign in by Facebook</button>
      {
        user.isSignIn && <div>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <img src={user.photo} alt="" />
        </div>
      }

      <div>
        <h2>Our own authentication</h2>
        <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="" />
        <label htmlFor="newUser">New user sign in</label>
        <form onSubmit={handleSubmit}>
          {
            newUser && <input name="name" placeholder='Your name' onBlur={handleBlur} type="text" />
          }
          <br />
          <input type="email" onBlur={handleBlur} name="email" placeholder='Your email' id="" required />
          <br />
          <input type="password" onBlur={handleBlur} name="password" placeholder='Password' id="" required />
          <br />
          <input type="submit" value={newUser ? 'Sign Up' : 'Sign In'} />
        </form>
      </div>
      {
        user.error && <p style={{ color: 'red' }}>Email already token</p>
      }
      {
        user.success && <p style={{ color: 'green' }}>User {newUser ? "created" : "logged in"} successfully</p>
      }

    </div>
  );
}

export default App;
