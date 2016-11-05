import React, { Component } from 'react';
import $ from '../js/jquery.min.js';
import slider from '../js/slider.jquery.js';

//dirty hack around namespacing problem
slider($);

class App extends Component {
  render() {
    return (
      <div>
        <Navbar schedule={this.props.schedule}/>
        <ShowView schedule={this.props.schedule}/>
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
             <a className="navbar-brand" href="#">ShowMaster {this.props.schedule.format}</a>
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
      active_scene: 0,
      next_programs: Object.assign({}, this.props.schedule.schedule[0].programs),
      current_programs: []
    };
  
    this.handleSceneChange = this.handleSceneChange.bind(this);
    this.handleNextScene= this.handleNextScene.bind(this)
  }
  
  handleNextScene() {
    if (this.state.active_scene >= this.props.schedule.schedule.length) { 
      console.log("End of schedule")
      return ;
    }
    this.setState({
      current_programs: this.state.next_programs
    })
    this.handleSceneChange(this.state.active_scene + 1)
    
  }
  
  handleSceneChange(active_scene) {
    active_scene = parseInt(active_scene);
    
    var programs = this.props.schedule.schedule[active_scene].programs
    this.setState({
      active_scene: active_scene,
      next_programs: Object.assign({}, programs)// shallow clone
    });
  }
  
  onCurrentSceneIntensity(program, intensity) {
    var programs = this.state.current_programs
    if (programs[program] == intensity) return;
    programs[program] = intensity
    this.setState({
      current_programs: programs,
    })
  }
  
  onNextSceneIntensity(program, intensity) {
    var programs = this.state.next_programs
    if (programs[program] == intensity) return;
    programs[program] = intensity
    this.setState({
      next_programs: programs,
    })
  }
  
  onNextProgramDelete(program) {
    var programs = this.state.next_programs
    delete programs[program]
    this.setState({
      next_programs: programs,
    })
  }
  
  onCurrentProgramDelete(program) {
    var programs = this.state.current_programs
    delete programs[program]
    this.setState({
      current_programs: programs,
    })
  }
  
  onActivateNextProgram(program) {
    var programs = this.state.next_programs
    programs[program] = 255
    this.setState({
      next_programs: programs,
    })
  }

  onActivateCurrentProgram(program) {
    var programs = this.state.current_programs
    programs[program] = 255
    this.setState({
      current_programs: programs,
    })
  }
  
  onActivateProgram(destination, program) {
    if (destination == "next") {
      this.onActivateNextProgram(program)
    } else {
      this.onActivateCurrentProgram(program)
    }
  }
  
  render() {
    return (
    <div className="container">
      <div className="row">
        <div className="col-md-3 ">
          <div className="list-group schedule-scenes">
            <ProgramView 
              active={this.state.active_scene} 
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
            programs={this.state.next_programs} 
            scene_lookup="next"
            onNextScene={this.handleNextScene}
            onIntensityChange={this.onNextSceneIntensity.bind(this)}
            onProgramDelete={this.onNextProgramDelete.bind(this)}/>
        </div>
        <div className="col-md-4">
          <SceneView
            programs={this.state.current_programs}
            onIntensityChange={this.onCurrentSceneIntensity.bind(this)}
            onProgramDelete={this.onCurrentProgramDelete.bind(this)}/>
        </div>
        <div className="col-md-2">
          <GlobalControls/>
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
    
    for(var key in this.props.scenes) {
      var scene = this.props.scenes[key];
      var active = (this.props.active == key)? "active": "";
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
    }
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
      destination: (this.state.destination == "next") ? "current" : "next"
    })
  }
  
  activateProgram(program) {
    this.props.onActivateProgram(this.state.destination, program)
  }
  
  render() {
    var programs = []
    for (var program_name in this.props.programs){
      programs.push(<QuickProgram 
        key={program_name} 
        name={program_name} 
        color='danger'
        onActivateProgram={this.activateProgram.bind(this)}/>)
    };
    for (var program_name in this.props.groups){
      programs.push(<QuickProgram key={program_name} name={program_name} 
        onActivateProgram={this.activateProgram.bind(this)}
        color='success'/>)
    };
    var destClass= (this.state.destination == "next") ? "btn-success" : "btn-danger"
    var destText= (this.state.destination == "next") ? "Next" : "Current"
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
// Shows a list of programs in a scene
class SceneView extends Component {
  render() {
    var header;
    var programs=[]
    if (this.props.scene_lookup === "next") {
      header =  (
        <h1>Next scene <GoButton onNextScene={this.props.onNextScene}/></h1>
      );
    }else {
      header = (
        <h1>Current Scene</h1>
      );
    }
    for (var key in this.props.programs) {
      var intensity = this.props.programs[key]
      programs.push(
        <SceneViewItem 
          onIntensityChange={this.props.onIntensityChange} 
          onProgramDelete={this.props.onProgramDelete}
          name={key} key={key} 
          intensity={intensity}/>
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
       max: 255,
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
      <div>
      </div>
    );
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

