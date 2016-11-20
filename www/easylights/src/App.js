import React, { Component } from 'react';
import $ from '../js/jquery.min.js';
import io from 'socket.io-client'
import slider from '../js/slider.jquery.js';


//dirty hack around namespacing problem
slider($);

class App extends Component {
  render() {
    return (
      <div>
        <Navbar schedule={this.props.schedule}/>
        <ShowView schedule={this.props.schedule} activePrograms={this.props.activePrograms}/>
      </div>
    );
  }
}

// Header on top
class Navbar extends Component {
  render() {
    return (
      <div className='navbar navbar-default'>
        <div className="container-fluid">
          <div className="navbar-header">
             <a className="navbar-brand" href="#">Dashboard {this.props.schedule.format}</a>
          </div>
        </div>
      </div>
    );
  }
}

// Main view
class ShowView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeScene: 0,
      nextPrograms: Object.assign({}, this.props.schedule.schedule[0].programs),
      currentPrograms: {}
    };
    this.socket = io('http://localhost:3030');
    this.handleSceneChange = this.handleSceneChange.bind(this);
    this.handleNextScene= this.handleNextScene.bind(this)
    this.socket.on('output', function (data) {
      if (data.value === 0) {
        this.deleteCurrentProgram(data.port, false)
      }else {
        this.setCurrentSceneIntensity(data.port, data.value * 100, false)
      }
    }.bind(this));
    
  }
  
  currentPrograms() {
    return Object.assign({}, this.state.currentPrograms)
  }
  
  sendProgramUpdate(program, value) {
    var data = {"port": program, "value": value / 100}
    console.log(data)
    this.socket.emit("output", data)
  }
  
  sendProgramUpdates(newPrograms) {
    var mergedPrograms = Object.keys(this.state.currentPrograms).concat(Object.keys(newPrograms))
    console.log(mergedPrograms);
    mergedPrograms.forEach(function(program) {
      var newValue = Math.round(newPrograms[program] || 0)
      var oldValue = Math.round(this.state.currentPrograms[program] || 0)
      if (oldValue !== newValue) {
        this.sendProgramUpdate(program, newValue)
      }
    }.bind(this))
    this.setState({currentPrograms: newPrograms})
  }
  
  handleNextScene() {
    if (this.state.activeScene >= this.props.schedule.schedule.length) { 
      console.log("End of schedule")
      return ;
    }
    this.sendProgramUpdates(this.state.nextPrograms) 
    this.handleSceneChange(this.state.activeScene + 1)
    
  }
  
  handleSceneChange(activeScene) {
    activeScene = parseInt(activeScene, 10);
    
    var programs = this.props.schedule.schedule[activeScene].programs
    this.setState({
      activeScene: activeScene,
      nextPrograms: Object.assign({}, programs)// shallow clone
    });
  }
  
  setCurrentSceneIntensity(program, intensity, sendUpdates=true) {
    var programs = this.currentPrograms()
    if (programs[program] === intensity) return;
    programs[program] = intensity
    if (sendUpdates === true) {
      this.sendProgramUpdates(programs)
    }else {
      this.setState({currentPrograms: programs})
    }
  }
  
  onCurrentSceneIntensity(program, intensity) {
    this.setCurrentSceneIntensity(program,intensity,true)
  }
  
  onNextSceneIntensity(program, intensity) {
    var programs = this.state.nextPrograms
    if (programs[program] === intensity) return;
    programs[program] = intensity
    this.setState({
      nextPrograms: programs,
    })
  }
  
  onNextProgramDelete(program) {
    var programs = this.state.nextPrograms
    delete programs[program]
    this.setState({
      nextPrograms: programs,
    })
  }
  
  deleteCurrentProgram(program, sendUpdates=true) {
    var programs = this.currentPrograms()
    delete programs[program]    
    if (sendUpdates === true) {
      console.log("Sending delete update")
      this.sendProgramUpdates(programs)
    }else {
      this.setState({currentPrograms: programs})
    }
  }
  
  onCurrentProgramDelete(program) {
    this.deleteCurrentProgram(program, true)
  }
  
  
  
  onActivateNextProgram(program) {
    var programs = this.state.nextPrograms
    programs[program] = 100
    this.setState({
      nextPrograms: programs,
    })
  }

  onActivateCurrentProgram(program) {
    var programs = this.currentPrograms()
    programs[program] = 100
    this.sendProgramUpdates(programs)
  }
  
  onActivateProgram(destination, program) {
    if (destination === "next") {
      this.onActivateNextProgram(program)
    } else {
      this.onActivateCurrentProgram(program)
    }
  }
  
  onPanicMode(programs) {
    this.sendProgramUpdates(programs)
  }
  render() {
    return (
    <div className="container">
      <div className="row">
        <div className="col-md-3 ">
          <div className="list-group schedule-scenes">
            <ProgramView 
              active={this.state.activeScene} 
              scenes={this.props.schedule.schedule}
              onSceneChange={this.handleSceneChange}
              
            />
          </div>
         <QuickProgramPicker 
            groups={this.props.schedule.groups} 
            programs={this.props.schedule.programs}
            onActivateProgram={this.onActivateProgram.bind(this)}
            />
        </div>
        <div className="col-md-3">
          <SceneView 
            programs={this.state.nextPrograms} 
            sceneLookup="next"
            onNextScene={this.handleNextScene}
            onIntensityChange={this.onNextSceneIntensity.bind(this)}
            onProgramDelete={this.onNextProgramDelete.bind(this)}/>
        </div>
        <div className="col-md-4">
          <SceneView
            programs={this.state.currentPrograms}
            onIntensityChange={this.onCurrentSceneIntensity.bind(this)}
            onProgramDelete={this.onCurrentProgramDelete.bind(this)}/>
        </div>
        <div className="col-md-2">
          <GlobalControls
            socket={this.socket}
            onPanicMode={this.onPanicMode.bind(this)}/>
        </div>
      </div>
    </div>
    )
  }
}

// List entry for ProgramView
class ProgramSceneView extends Component {
  onSceneChange() {
    this.props.onSceneChange(this.props.sceneKey);
  }
  
  render() {
    return (
      <a href="#" className={"list-group-item " + this.props.active}
          onClick={this.onSceneChange.bind(this)}>
        <h4 className="list-group-item-heading">{this.props.name}</h4>
        <p className="list-group-item-text">{this.props.desc}</p>
      </a>
    )
  }
}

// Shows a  list of all scenes
class ProgramView extends Component {
  render() {
    var scenes = []
    var sceneKeys = Object.keys(this.props.scenes)
    sceneKeys.forEach(function(key) {
      var scene = this.props.scenes[key];
      var active = (this.props.active === key)? "active": "";
      scenes.push(
        <ProgramSceneView 
           active={active} 
           name={scene.name} 
           desc={scene.desc}
           sceneKey={key}
           key={key}
           onSceneChange={this.props.onSceneChange}
          />
      )
    }.bind(this))
    return (
      <div>
        {scenes}
      </div>
    );
  }
}

// Entry for QuickProgramPicker
class QuickProgram extends Component {
  render() {
    return (
      <span 
        onClick={this.props.onActivateProgram.bind(this, this.props.name)}
        className={"label label-" + this.props.color}>{this.props.name}</span>
    );
  }
}

//Shows all groups and programs, allows user to quickly add them to either
// next scene or current scene
class QuickProgramPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      destination: "next"
    }
  }
  
  swapDestination(newDestination) {
    this.setState( {
      destination: (this.state.destination === "next") ? "current" : "next"
    })
  }
  
  activateProgram(program) {
    this.props.onActivateProgram(this.state.destination, program)
  }
  
  render() {
    var programs = []
    var programNames = Object.keys(this.props.programs)
    programNames.forEach(function(programName){
      programs.push(<QuickProgram 
        key={programName} 
        name={programName} 
        color='danger'
        onActivateProgram={this.activateProgram.bind(this)}/>)
    }.bind(this));
    var groupNames = Object.keys(this.props.groups)
    groupNames.forEach(function(programName){
      programs.push(<QuickProgram key={programName} name={programName} 
        onActivateProgram={this.activateProgram.bind(this)}
        color='success'/>)
    }.bind(this));
    var destClass= (this.state.destination === "next") ? "btn-success" : "btn-danger"
    var destText= (this.state.destination === "next") ? "Next" : "Current"
    return (
      <div className='quick-programs'>
        <h4>Quick Programs
         <span className='quick-dest'>
            <button type="button" className={"btn " + destClass} onClick={this.swapDestination.bind(this)}>{destText}</button>
         </span>
        </h4>
        {programs}
      </div>
    );
  }
}

class SceneViewItem extends Component {
  render() {
    return ( <div className="panel panel-primary">
        <div className="panel-heading">{this.props.name}
          <span className='close' onClick={this.props.onProgramDelete.bind(this,this.props.name)}>X</span>
        </div>
        <div className="panel-body">
          <IntensitySlider onChange={this.props.onIntensityChange.bind(this, this.props.name)} value={this.props.intensity}/>
        </div>
      </div>
    )
  }
}

class EmptySceneView extends Component {
  render() {
    return ( <div className="panel panel-info">
        <div className="panel-heading">Darkness
        </div>
        <div className="panel-body">
          All lights are off!
        </div>
      </div>
    )
  }
}
// Shows a list of programs in a scene
class SceneView extends Component {
  render() {
    var header;
    var programs=[]
    if (this.props.sceneLookup === "next") {
      header =  (
        <h1>Next scene <GoButton onNextScene={this.props.onNextScene}/></h1>
      );
    }else {
      header = (
        <h1>Current Scene</h1>
      );
    }
    var programKeys = Object.keys(this.props.programs)
    programKeys.forEach(function(key) {
      var intensity = this.props.programs[key]
      programs.push(
        <SceneViewItem 
          onIntensityChange={this.props.onIntensityChange} 
          onProgramDelete={this.props.onProgramDelete}
          name={key} key={key} 
          intensity={intensity}/>
      )
    }.bind(this))
    if (programs.length === 0) {
      programs = (
        <EmptySceneView/>
      )
    }
    return (
      <div>
        {header}
        {programs}
      </div>
    );
  }
}

class IntensitySlider extends Component {
  componentDidMount() {
    this.slider = $(this.refs.intensitySlider).freshslider({
       step: 1,
       max: 100,
       value: this.props.value,
       onchange: this.props.onChange
    });
  }
  
  componentDidUpdate(prevProps, prevState) {
    this.slider.onchange = undefined
    this.slider.setValue(this.props.value)
    this.slider.onchange = this.props.onChange
  }
  
  render() {
    return (
      <div ref='intensitySlider' data-value={this.props.value} style={{width: '95%'}}></div>
    );
  }
}

// Shows Beat button, Panic buttons
class GlobalControls extends Component {
  render() {
    return (
      <div className='global-controls'>
       <BeatButton socket={this.props.socket}/>
       <SafeModes onPanicMode={this.props.onPanicMode}/>
      </div>
    );
  }
}

class BeatButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blinkClass: ""
    }
  }
  
  componentDidMount() {
    this.props.socket.on("input", function(data) {
      var bpm = Math.round(data.value * 60 *20)
      this.setState({bpm: bpm})
      if (data.port === "beat"){
        this.blink()
      }
    }.bind(this))
  }
  
  blink() {
    this.setState({blinkClass: "btn-blink"})
    setTimeout(function() {
      this.setState({blinkClass: ""})
    }.bind(this), 100)
  }
  
  render() {
    return ( 
    <div className='beat'>
      <button id="button-beat" type="button" className={"btn btn-primary " + this.state.blinkClass} aria-label="Left Align">
      <span className="" aria-hidden="true">{this.state.bpm} BPM</span>
      </button>
    </div>)
  }
}

class SafeModes extends Component{
  
  render() {
    return (
      <div>
        <p>Panic modes:</p>
        <div className="btn-group" role="group" aria-label="...">
          <button type="button" className="btn btn-warning" onClick={this.props.onPanicMode.bind(undefined, {"wit": 100})}>Failsafe</button>
          <button type="button" className="btn btn-danger" onClick={this.props.onPanicMode.bind(undefined, {})}>Black</button>
        </div>
      </div>
    )
  }
}
class GoButton extends Component {

  render() {
    return (
      <span>
          <button onClick={this.props.onNextScene} id="button-go" type="button" className="btn btn-success" aria-label="Left Align">
            <span aria-hidden="true">GO &gt;&gt; </span>
          </button>
      </span>
    )
  }
}
export default App;

