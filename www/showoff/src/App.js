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
      next_programs: this.props.schedule.schedule[0].programs,
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
      next_programs: programs
    });
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
            />
        </div>
        <div className="col-md-3">
          <SceneView 
            programs={this.state.next_programs} 
            scene_lookup="next"
            onNextScene={this.handleNextScene}/>
        </div>
        <div className="col-md-4">
          <SceneView
            programs={this.state.current_programs}/>
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
      <span className={"label label-" + this.props.color}>{this.props.name}</span>
    );
  }
}

//Shows all groups and programs, allows user to quickly add them to either
// next scene or current scene
class QuickProgramPicker extends Component {
  render() {
    var programs = []
    for (var program_name in this.props.programs){
      programs.push(<QuickProgram key={program_name} name={program_name} color='danger'/>)
    };
    for (var program_name in this.props.groups){
      programs.push(<QuickProgram key={program_name} name={program_name} color='success'/>)
    };
    
    return (
      <div className='quick-programs'>
        <h4>Quick Programs</h4>
        {programs}
      </div>
    );
  }
}

class SceneViewItem extends Component {
  render() {
    return ( <div className="panel panel-primary">
        <div className="panel-heading">{this.props.name}</div>
        <div className="panel-body">
          <IntensitySlider value={this.props.intensity}/>
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
        <SceneViewItem name={key} key={key} intensity={intensity}/>
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
       value: this.props.value
    });
  }
  
  componentDidUpdate(prevProps, prevState) {
    this.slider.setValue(this.props.value);
  }
  
  render() {
    return (
      <div ref='intensitySlider' data-value={this.props.value} style={{width: 200}}></div>
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

