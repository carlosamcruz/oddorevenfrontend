import React from 'react';
import { useState, useEffect } from 'react';
import Header from './Header';
import { gameState, initGame, insertGameKey, insertPlayerOption, Options, gameData, cancel, acceptGame, resultGame} from './Web3Service';

function App() {
  const [message, setMessage] = useState("");
  const [gameKey, setGameKey] = useState("0000000000000000000000000000000000000000000000000000000000000000");

  const [playerOption, setPlayerOption] = useState(Number);
  const [gameDataThis, setGameDataThis] = useState(gameData);

  useEffect(()=>{  
    gameState()
      .then(state => setGameDataThis(state))
      .catch(err => setMessage(err.message));

  }, []);
  
  function onInputGameKey(event: React.ChangeEvent<HTMLInputElement>){
    setGameKey(event.target.value);
  }

  function onInputPlayerOption(event: React.ChangeEvent<HTMLInputElement>){
    setPlayerOption(Number(event.target.value));
  }
  

  function onChangeGameKey(){

    console.log('GameData: ', gameDataThis);

    insertGameKey(gameKey)
      .then(tx => setMessage(tx))
      .catch(err => setMessage(err.message)); 
  }

  function onChangeP1Option(){

    insertPlayerOption(playerOption, true)
      .then(option => setMessage(String(option)))
      .catch(err => setMessage(err.message)); 

  }

  function onChangeP2Option(){

    insertPlayerOption(playerOption, false)
      .then(option => setMessage(String(option)))
      .catch(err => setMessage(err.message)); 

  }


  function onPlay(option: Options){
    setMessage("");
    initGame(option == 1 ? true: false)
      .then(state => setGameDataThis(state))
      //.then(result => setLeaderboard({...leaderboard, result}))
      .catch(err => setMessage(err.message));
  }

  function onCancel(){
    setMessage("");
    cancel()
      .then(state => setGameDataThis(state))
      //.then(result => setLeaderboard({...leaderboard, result}))
      .catch(err => setMessage(err.message));
  }

  function onAccept(){
    setMessage("");
    acceptGame()
      .then(state => setGameDataThis(state))
      //.then(result => setLeaderboard({...leaderboard, result}))
      .catch(err => setMessage(err.message));
  }

  function onResult(){
    setMessage("");
    resultGame()
      .then(state => setGameDataThis(state))
      //.then(result => setLeaderboard({...leaderboard, result}))
      .catch(err => setMessage(err.message));
  }

  function onClaim(){
    setMessage("");
    resultGame()
      .then(state => setGameDataThis(state))
      //.then(result => setLeaderboard({...leaderboard, result}))
      .catch(err => setMessage(err.message));
  }

  return (
    <div className='container'>
        <Header />
        <main>
          <div className='py-0 text-center'>

            <img className='d-block mx-auto mb-4' src='./logo512.png' alt='OddOrEven' width={72}/>
            <h2> Odd or Even </h2>
            <p className='lead'> Play the game. </p>
            <p className='lead text-danger'> {message} </p>
          </div>
          <div className='col-md-8 col-lg-12'>
            <div className='row'>

              <div className='py-5 col-sm-6'>
                <div className='col-sm-12'> 
                  <label htmlFor='gamekey' className='form-label'> Player 1 Game Key (hex):</label>
                  <div className='input-group'>
                    <input type='hex' className='form-control' id='gamekey' value={gameKey || ""} onChange={onInputGameKey}/>
                    <span className='input-group-text bg-secondary'>hex</span>
                    <button type='button' className='btn btn-primary d-inline-flex align-items-center' onClick={onChangeGameKey}>Insert</button>

                  </div>
                </div>
                <div className='py-5 col-sm-12'> 
                  <label htmlFor='playerOption' className='form-label'> Player Option (0 to 10):</label>
                  <div className='input-group'>
                    <input type='number' className='form-control' id='gamekey' value={playerOption || 0} onChange={onInputPlayerOption}/>
                    <span className='input-group-text bg-secondary'>num</span>
                    {
                      gameDataThis.hashOptionP1 == "0x0000000000000000000000000000000000000000000000000000000000000000"  ?
                      <button type='button' className='btn btn-primary d-inline-flex align-items-center' onClick={onChangeP1Option}>Insert</button>
                      :
                      gameDataThis.optionP2 == -1?
                      <button type='button' className='btn btn-primary d-inline-flex align-items-center' onClick={onChangeP2Option}>Insert</button>
                      :
                      <button type='button' className='btn btn-primary d-inline-flex align-items-center' onClick={onChangeP1Option}>Insert</button>

                    }

                  </div>
                </div>
              </div>
              <div className='col-sm-6'>
                <h4 className='mb-0'>Games</h4>
                <div className='card card-body border-0 shadow'>
                  <h5 className='mb-3 text-primary'>
                    {  gameDataThis.hashOptionP1 == "0x0000000000000000000000000000000000000000000000000000000000000000"  ? 
                      "Initialize Game:"
                      :
                      gameDataThis.optionP2 == -1?
                      "Hash Player 1:"
                      :
                      "Player 2 Option"
                    }
                    </h5>
                  <div className='alert alert-success'>
                    {
                      //"Loading ..."
                      gameDataThis.hashOptionP1 == "0x0000000000000000000000000000000000000000000000000000000000000000"  ? 
                      "Insert Game Key and Number Choice:"
                      :
                      gameDataThis.optionP2 == -1?
                      gameDataThis.hashOptionP1
                      :
                      gameDataThis.optionP2
                    }
                  </div>
                  <h5 className='mb-3 text-primary'>
                    {
                      //leaderboard && leaderboard.result?.indexOf("won") !== -1 || !leaderboard?.result
                      //? "Start a new game:"
                      //:
                      gameDataThis.hashOptionP1 == "0x0000000000000000000000000000000000000000000000000000000000000000"  ? 
                      "Choose Odd or Even:"
                      :
                      gameDataThis.optionP2 == -1?
                      "Accept or Quit Game"
                      :
                      "Result or Claim Game"
                    }
                  </h5>
                    {
                      gameDataThis.hashOptionP1 == "0x0000000000000000000000000000000000000000000000000000000000000000"  ?
                      <div className='d-flex'>
                        <div className='col-sm-6'>
                          <div className='alert alert-info me-3 play-button' onClick={() => onPlay(Options.ODD)}>
                            <img src='/assets/odd.png' width={100} alt='Odd'/>
                          </div>
                        </div>
                        <div className='col-sm-6'>
                          <div className='alert alert-info ms-3 play-button' onClick={() => onPlay(Options.EVEN)}>
                            <img src='/assets/even.png' width={100} alt='Even'/>
                          </div>
                        </div>
                      </div>
                      :
                      gameDataThis.optionP2 == -1?
                      <div className='d-flex'>
                        <div className='col-sm-6'>
                          <div className='alert alert-info me-3 play-button' onClick={() => onAccept()}>
                            <img src='/assets/play.png' width={100} alt='Play'/>
                          </div>
                        </div>
                        <div className='col-sm-6'>
                          <div className='alert alert-info ms-3 play-button' onClick={() => onCancel()}>
                            <img src='/assets/cancel.png' width={100} alt='Cancel'/>
                          </div>
                        </div>
                      </div>
                      :
                      <div className='d-flex'>
                        <div className='col-sm-6'>
                          <div className='alert alert-info me-3 play-button' onClick={() => onResult()}>
                            <img src='/assets/play.png' width={100} alt='Play'/>
                          </div>
                        </div>
                        <div className='col-sm-6'>
                          <div className='alert alert-info ms-3 play-button' onClick={() => onClaim()}>
                            <img src='/assets/cancel.png' width={100} alt='Cancel'/>
                          </div>
                        </div>
                      </div>

                    }
                </div>
                
              </div>

            </div>

          </div>
        </main>
    </div>
  );
}

export default App;


/*
import React from 'react';
import Header from './Header';

function App() {
  return (
    <div className="container">
      <Header />
      <main>
        App Page
      </main>
    </div>
  );
}

export default App;

*/