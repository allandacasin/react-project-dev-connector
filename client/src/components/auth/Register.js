import React, {Fragment, useState} from 'react'
import {Link, Redirect} from 'react-router-dom'
import { connect } from 'react-redux'
import {setAlert} from '../../actions/alert'
import PropTypes from 'prop-types'
import {register} from '../../actions/auth'


const Register = ({setAlert, register, isAuthenticated}) => {

  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    password: '', 
    confirm_password: ''});

  const {name, email, password, confirm_password} = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]:e.target.value})
  }

  const onSubmit = e => {
    e.preventDefault();
    if(password !== confirm_password){
      setAlert('Passwords not match.', 'danger')
    } else {

      register({name, email, password});
    }
  }


  //Redirect if registered
  if(isAuthenticated) {
    return <Redirect to="/dashboard" />
  }


  return (
    <Fragment>
      <h1 className="large text-primary">Sign Up</h1>
      <p className="lead"><i className="fas fa-user"></i> Create Your Account</p>
      <form className="form" action="create-profile.html" onSubmit={e => onSubmit(e)}>
        <div className="form-group">
          <input type="text" placeholder="Name" name="name" value={name} onChange={e => onChange(e)} />
        </div>
        <div className="form-group">
          <input type="email" placeholder="Email Address" name="email" value={email} onChange={e => onChange(e)}/>
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}            
            // minLength="6"
            onChange={e => onChange(e)}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirm_password"
            value={confirm_password}
            // minLength="6"
            onChange={e => onChange(e)}
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Register" />
      </form>
      <p className="my-1">
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </Fragment>
    
  )
}

Register.propTypes = {

  setAlert: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
}

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, {setAlert, register})(Register)
