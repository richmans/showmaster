import React, { Component } from 'react';
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

class ShowView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active_scene: 0
    };
  
    this.handleSceneChange = this.handleSceneChange.bind(this);
  }
  
  handleSceneChange(active_scene, other, things, and, such) {
    console.log( active_scene)
    console.log( other)
    console.log( things)
    console.log( and)
    console.log( such)
    this.setState({
      active_scene: active_scene
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
          <SceneView scene_lookup="next"/>
        </div>
        <div className="col-md-4">
          <SceneView/>
        </div>
        <div className="col-md-2">
          <GlobalControls/>
        </div>
      </div>
    </div>
    )
  }
}

class ProgramSceneView extends Component {
  onSceneChange() {
    console.log(this.props.sceneKey)
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
class ProgramView extends Component {
  render() {
    var scenes = []
    
    for(var key in this.props.scenes) {
      console.log(key)
      var scene = this.props.scenes[key];
      var active = (this.props.active == key)? "active": "";
      scenes.push(
        <ProgramSceneView 
           active={active} 
           name={scene.name} 
           desc={scene.desc}
           sceneKey={key}
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


class QuickProgram extends Component {
  render() {
    return (
      <span className={"label label-" + this.props.color}>{this.props.name}</span>
    );
  }
}
class QuickProgramPicker extends Component {
  render() {
    var programs = []
    for (var program_name in this.props.programs){
      programs.push(<QuickProgram name={program_name} color='danger'/>)
    };
    for (var program_name in this.props.groups){
      programs.push(<QuickProgram name={program_name} color='success'/>)
    };
    
    return (
      <div className='quick-programs'>
        <h4>Quick Programs</h4>
        {programs}
      </div>
    );
  }
}


class SceneView extends Component {
  render() {
    var header;
    if (this.props.scene_lookup === "next") {
      header =  (
        <h1>Next scene <GoButton/></h1>
      );
    }else {
      header = (
        <h1>Current Scene</h1>
      );
    }
  
    return (
      <div>
        {header}
      </div>
    );
  }
}

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
          <button id="button-go" type="button" className="btn btn-success" aria-label="Left Align">
            <span aria-hidden="true">GO &gt;&gt; </span>
          </button>
      </span>
    )
  }
}
export default App;

