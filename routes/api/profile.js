const express = require('express');
const auth = require('../../middleware/auth')
const router = express.Router();
const Profile = require('../../models/Profile');
const {check, validationResult} = require('express-validator');
const request = require('request');
const config = require('config');
const Post = require('../../models/Post');

//@route    GET api/profile/id
//@desc     Get profile
//@access   Private
router.get('/id', auth, async (req,res) => {

  try {

    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

    if(!profile) {

      return res.status(400).json({ msg: 'There is no profile for this user.'})
    }

    res.json(profile);
    
  } catch (error) {
    
    console.error(error.message);
    res.status(500).send('Server Error.')
  }

});


// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post('/', 

  [auth, [

    check('status', 'Status is required.').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()

    ]
  ],

  async (req, res) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    //Build profile object
    const profileFields = {};

    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;

    //Build Skills array
    if(skills) {
      //convert to array
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }


    //Build Social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      // using upsert option (creates new doc if no match is found):
      let profile = await Profile.findOneAndUpdate(
        //filter
        {user: req.user.id},
        //set/update
        {$set: profileFields},
        //upsert
        {new: true, upsert:true}
      );
      
      res.json(profile);
      
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error.')
    }



  }
)


// @route    GET api/profile
// @desc     Get All Profiles
// @access   Public
router.get('/', async (req,res) => {

  try {

    const profiles = await Profile.find().populate('user', ['name', 'avatar']);

    if(!profiles) {   await profile.save();

      return res.status(400).json({ msg: 'There is no profile for this user.'})
    }

    res.json(profiles);
    
  } catch (error) {
    
    console.error(error.message);
    res.status(500).send('Server Error.')
  }

});


// @route    GET api/profile/user/:user_id
// @desc     Get Profile by User id
// @access   Private
router.get('/user/:user_id', async (req,res) => {

  try {

    const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar']);

    if(!profile) {

      return res.status(400).json({ msg: 'Profile not found.'})
    }
    

    res.json(profile);
    
  } catch (error) {

    if(error.kind = 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found.'})
    }
    
    console.error(error.message);
    res.status(500).send('Server Error.')
  }

});


// @route    DELETE api/profile/
// @desc     DELETE Profile by User id
// @access   Private
router.delete('/', auth, async (req,res) => {

  try {

    // remove user posts
    await Post.deleteMany({ user: req.user.id });

    //remove profile
    await Profile.findOneAndRemove({user: req.user.id});

    //remove also the user???
    await User.findOneAndRemove({_id: req.user.id});

    res.send("Profile Deleted");
    
  } catch (error) {

    console.error(error.message);
    res.status(500).send('Server Error.')
  }

});



// @route    PUT api/profile/experience
// @desc     Add experience in profile
// @access   Private
router.put('/experience', 

  [auth, [

    check('title', 'Job title is required.').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'Start date is required').not().isEmpty()

    ]
  ],

  async (req, res) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    }
 
    try {
      
      let profile = await Profile.findOneAndUpdate({user: req.user.id});
      
      //unshift() - add new items to the beginning of an array
      profile.experience.unshift(newExp);
      
      await profile.save();
      
      res.json(profile);
      
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error.')
    }

  }
)



// @route    DELETE api/profile/experience
// @desc     Delete experience in profile
// @access   Private
router.delete('/experience/:exp_id', auth,

  async (req, res) => {

    try {
      
      const profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $pull: { experience: { _id: req.params.exp_id } } },
        { new: true }
      );
      
      //The $pull operator removes from an existing array (right now: the experience array) all 
      //instances of a value or values that match a specified condition - right now the condition 
      //is to be equal to the id param that was given to it.
      
      res.json(profile);
      
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error.')
    }

  }
)



// @route    PUT api/profile/education
// @desc     Add education in profile
// @access   Private
router.put('/education', 

  [auth, [

    check('school', 'School is required.').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of Study is required').not().isEmpty(),
    check('from', 'Start date is required').not().isEmpty()

    ]
  ],

  async (req, res) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    const newEduc = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    }
 
    try {
      
      let profile = await Profile.findOneAndUpdate({user: req.user.id});
      
      //unshift() - add new items to the beginning of an array
      profile.education.unshift(newEduc);
      
      await profile.save();
      
      res.json(profile);
      
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error.')
    }

  }
)



// @route    DELETE api/profile/education
// @desc     Delete education in profile
// @access   Private
router.delete('/education/:educ_id', auth,

  async (req, res) => {

    try {
      
      const profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $pull: { education: { _id: req.params.educ_id } } },
        { new: true }
      );
      
      //The $pull operator removes from an existing array (right now: the education array) all 
      //instances of a value or values that match a specified condition - right now the condition 
      //is to be equal to the id param that was given to it.
      
      res.json(profile);
      
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error.')
    }

  }
)

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
router.get('/github/:username', (req, res) => {

  try {

    const options = {
      uri: `https://api.github.com/users/${
        req.params.username}/repos?per_page=5&sort=created:asc&client_id=${
        config.get('githubClientId')}&client_secret=${
        config.get('githubClientSecret')}`,
        method: 'GET',
        headers: {'user-agent' : 'node.js'}
        };

    request(options, (error, response, body) => {
      
      if(error) console.error(error);

      if(response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No Github profile found.'})
      }

      res.json(JSON.parse(body));

    })

  } catch (error) {

    console.error(error.message);
    res.status(500).send('Server Error.')
  }

})



module.exports = router;