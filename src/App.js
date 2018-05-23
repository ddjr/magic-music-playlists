import React, { Component } from 'react';
import './App.css';

let defaultTextColor = '#fff';
let defaultStyle = {
  color: defaultTextColor
};
let fakeServerData = {
  user: {
    name: 'David',
    playlists: [
      {
        name: 'My favorites',
        songs: [
          { name: 'Beat it', duration: 1345} ,
          { name: 'Cannelloni Makaroni', duration: 1345},
          { name: 'Rosa helikopter', duration: 532}
        ]
      },
      {
        name: 'Dance mix',
        songs: [
          { name: 'Brainpower', duration: 1345},
          { name: 'Cannelloni Makaroni', duration: 1232},
          { name: 'let it go', duration: 532}
        ]
      },{
        name: 'Chill Piano',
        songs: [
          { name: 'Cannelloni Makaroni', duration: 2532},
          { name: 'Can you feel it', duration: 1532},
          { name: 'Rosa helikopter', duration: 932}
        ]
      },{
        name: 'Hot right now!',
        songs: [
          { name: 'DANCE! ', duration: 2532},
          { name: 'Cannelloni Makaroni', duration: 1532},
          { name: 'Rosa helikopter', duration: 832}
        ]
      }
    ]
  }
};
class PlaylistCounter extends Component {
  render() {
    return (
      <div style={{...defaultStyle, width: '40%', display: 'inline-block'}}>
        <h2>{this.props.playlists.length} playlists</h2>
      </div>
    );
  }
}
class HoursCounter extends Component {
  render() {
    let allSongs = this.props.playlists.reduce((songs, eachPlaylist) => {
        return songs.concat(eachPlaylist.songs)
    },[])
    let totalDuration = allSongs.reduce((sum, eachSong) => {
      return sum + eachSong.duration
    }, 0)
    return (
      <div style={{...defaultStyle, width: '40%', display: 'inline-block'}}>
        <h2>{Math.round(totalDuration/60)} hours</h2>
      </div>
    );
  }
}
class Filter extends Component {
  render() {
    return (
      <div style={defaultStyle}>
        <img />
        <input type="text" onChange={event => this.props.onTextChange(event.target.value)}/>
        Filter
      </div>
    );
  }
}
class Playlist extends Component {
  render() {
    return (
      <div style={{...defaultStyle, display:'inline-block', width: '25%'}}>
        <img />
        <h3>{this.props.playlist.name}</h3>
        <ul>
          {this.props.playlist.songs.map(song =>
            <li>{song.name}</li>
          )}
        </ul>
      </div>
    );
  }
}

class App extends Component {
  constructor() {
    super()
    this.state = {
      serverData: {},
      filterString: ''
    }
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({serverData: fakeServerData});
    }, 1000)

  }
  render() {
      let name = 'David'
      let green = "#FF1212"
      let headerStyle = { color: green, "font-size": '50px' }
    return (
      <div className="App">
        {this.state.serverData.user ?
        <div>
          <h1 style={{...defaultStyle, 'font-size':' 54px'}}>
            {this.state.serverData.user.name}'s Playlists
          </h1>
          <PlaylistCounter playlists={this.state.serverData.user.playlists} />
          <HoursCounter playlists={this.state.serverData.user.playlists} />
        <Filter onTextChange={text => this.setState({filterString: text})}/>
        {this.state.serverData.user.playlists.filter(playlist =>
          playlist.name.toLowerCase().includes(
            this.state.filterString.toLowerCase())
        ).map(playlist =>
          <Playlist playlist={playlist}/>
        )}
      </div> : <h1 style={defaultStyle}>Loading...</h1>
      }
      </div>
    );
  }
}

export default App;
