import React, { Component } from 'react';
import 'reset-css/reset.css';
import './App.css';
import queryString from 'query-string';

let defaultStyle = {
  color: '#fff',
  'fontFamily': 'Helvetica neue, Helvetica',
  'align': 'center'
}
let counterStyle = {...defaultStyle,
  width: '40%',
  display: 'inline-block',
  'marginBottom': '10px',
  'fontSize': '20px',
  'lineHeight': '30px'
}
let playlistsStyle = {
  'display': 'flex',
  'flex-flow': 'row wrap',
  'margin': '20px auto'
}
class PlaylistCounter extends Component {
  render() {
    return (
      <div style={counterStyle}>
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
    let isTooLow = totalDuration < 60*60
    let HoursCounterStyle = {...counterStyle,
      color: isTooLow ? 'red' : 'white',
      fontWeight: isTooLow ? 'bold' : 'normal'
    }
    return (
      <div style={HoursCounterStyle}>
        <h2>{Math.round(totalDuration/60)} minutes</h2>
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
    let playlistStyle = {...defaultStyle,
      width: '24.8%',
      display: 'inline-block',
      backgroundColor: this.props.index % 2 ? '#C0C0C0' : '#808080',
      padding: '10px',
      'margin': '1px'
    }
    return (
      <div style={playlistStyle} >
        <img src={this.props.playlist.imageUrl} style={{width: '100%'}}/>
        <h3 style={{fontWeight: 'bold', textDecoration: 'underline'}}>{this.props.playlist.name}</h3>
        <ul style={{marginTop: '10px'}}>
          {this.props.playlist.songs.map(song =>
            <li style={{paddingTop: '2px'}}>{song.name}</li>
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
      user: null,
      playlists: [],
      filterString: ''
    }
  }
  fetchFromAPI(endpoint, accessToken) {
    return fetch(endpoint, {headers: {'Authorization': 'Bearer ' + accessToken}})
    .then(response => response.json())
  }
  getPlaylistTracksPromises(playlistData, accessToken) {
    let playlists = playlistData.items
    let trackDataPromises = playlists.map(playlist => {
      this.fetchFromAPI(playlist.tracks.href, accessToken)
    })
  }
  componentDidMount() {
    let parsed = queryString.parse(window.location.search)
    let accessToken = parsed.access_token
    if (!accessToken) {return }

    this.fetchFromAPI('https://api.spotify.com/v1/me', accessToken)
    .then(data => this.setState({
      user: {
        name: data.display_name
      }
    }))

   this.fetchFromAPI('https://api.spotify.com/v1/me/playlists', accessToken)
   .then(playlistData => {
    let playlists = playlistData.items
    let trackDataPromises = playlists.map(playlist => {
      let responsePromise = fetch(playlist.tracks.href, {
        headers: {'Authorization': 'Bearer ' + accessToken}
      })
      let trackDataPromise = responsePromise
        .then(response => response.json())
      return trackDataPromise
    })
    let allTracksDataPromises =
      Promise.all(trackDataPromises)
    let playlistsPromise = allTracksDataPromises.then(trackDatas => {
      trackDatas.forEach((trackData, i) => {
        playlists[i].trackDatas = trackData.items
          .map(item => item.track)
          .map(trackData => ({
            name: trackData.name,
            duration: trackData.duration_ms / 1000
          }))
      })
      return playlists
    })
    return playlistsPromise
  })
  .then(playlists => this.setState({
    playlists: playlists.map(item => {
      return {
        name: item.name,
        imageUrl: item.images[0].url,
        songs: item.trackDatas.slice(0,3)
      }
  })
  }))

  }

  filterPlaylists() {
    return (
      this.state.user &&
      this.state.playlists
        ? this.state.playlists.filter(playlist => {
          let matchesPlaylist = playlist.name.toLowerCase().includes(
            this.state.filterString.toLowerCase())
          let matchesSong = playlist.songs.find(song => song.name.toLowerCase().includes(
            this.state.filterString.toLowerCase()))
          return matchesPlaylist || matchesSong
        })
        : []
    )
  }
  render() {
      let playlistsToRender = this.filterPlaylists()

    return (
      <div className="App">
      {this.state.user
        ? <div>
            <h1 style={{...defaultStyle,
              'fontSize':' 54px',
              'marginTop': '5px'
            }}>
              {this.state.user.name}'s Playlists
            </h1>
            {this.state.playlists &&
              <div>
                <PlaylistCounter playlists={playlistsToRender} />
                <HoursCounter playlists={playlistsToRender} />
                <Filter onTextChange={text => this.setState({filterString: text})}/>
                <div style={playlistsStyle}>
                  {playlistsToRender.map((playlist, i) =>
                    <Playlist playlist={playlist} index={i}/>
                  )}
                </div>
              </div>
            }
          </div>
        : <button onClick={() => {
          window.location =  window.location.href.includes('localhost')
          ? 'http://localhost:8888/login'
          : 'https://spotify-backend-playlist.herokuapp.com/login' }
        }
        style={{'padding': '20px', 'fontSize': '50px', 'marginTop': '20px', 'margin': '20px 40%'}} >Sign in with Spotify</button>
      }
      </div>
    );
  }
}

export default App;
