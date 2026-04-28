const { User } = require('../models/mysql');

const updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const updateData = {};
    
    // Only update allowed fields
    if (req.body.fullName) updateData.fullName = req.body.fullName;
    if (req.body.bio) updateData.bio = req.body.bio;
    
    if (req.file) {
      updateData.avatarUrl = req.file.path; // Cloudinary returns the URL in file.path
    }

    await User.update(updateData, { where: { id } });

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['passwordHash'] }
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateProfile
};
