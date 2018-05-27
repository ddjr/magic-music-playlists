import React, { Component } from 'react';
import './App.css';
import queryString from 'query-string';

let defaultTextColor = '#fff';
let defaultStyle = {
  color: defaultTextColor
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
        <img src={this.props.playlist.imageUrl} style={{width: '60px'}}/>
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
      user: {},
      playlists: [],
      filterString: ''
    }
  }
  componentDidMount() {
    let parsed = queryString.parse(window.location.search)
    let accessToken = parsed.access_token
    if (!accessToken) { return }
    fetch('https://api.spotify.com/v1/me', {headers: {'Authorization': 'Bearer ' + accessToken}})
    .then(response => response.json())
    .then(data => this.setState({
      user: {
        name: data.display_name
      }
    }))

    fetch('https://api.spotify.com/v1/me/playlists', {headers: {'Authorization': 'Bearer ' + accessToken}})
    .then(response => response.json())
    .then(data => this.setState({
      playlists: data.items.map(item => ({
        name: item.name,
        imageUrl: item.images[0].url,
        songs:[]
      }))
    }))
    
  }

  filterPlaylists() {
    return (
      this.state.user &&
      this.state.playlists
        ? this.state.playlists.filter(playlist =>
          playlist.name.toLowerCase().includes(
            this.state.filterString.toLowerCase()))
        : []
    )
  }
  render() {
      let playlistsToRender = this.filterPlaylists()

    return (
      <div className="App">
      {this.state.user
        ? <div>
            <h1 style={{...defaultStyle, 'fontSize':' 54px'}}>
              {this.state.user.name}'s Playlists
            </h1>
            {this.state.playlists &&
              <div>
                <PlaylistCounter playlists={playlistsToRender} />
                <HoursCounter playlists={playlistsToRender} />
                <Filter onTextChange={text => this.setState({filterString: text})}/>
                {playlistsToRender.map(playlist =>
                  <Playlist playlist={playlist}/>
                )}
              </div>
            }
          </div>
        : <button style={{'padding': '20px', 'fontSize': '50px', 'marginTop': '20px'}} onClick={() => window.location="http://localhost:8888/login"}>Sign in with Spotify</button>
      }
      </div>
    );
  }
}

export default App;
