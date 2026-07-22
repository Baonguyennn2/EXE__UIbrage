const { Manual } = require('../models/mysql');

exports.getAllManuals = async (req, res) => {
  try {
    const manuals = await Manual.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(manuals);
  } catch (error) {
    console.error('Error fetching manuals:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getManualCategories = async (req, res) => {
  try {
    const categories = await Manual.findAll({
      attributes: ['category'],
      group: ['category'],
      order: [['category', 'ASC']]
    });
    // Return array of strings
    res.json(categories.map(c => c.category));
  } catch (error) {
    console.error('Error fetching manual categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createManual = async (req, res) => {
  try {
    const { title, category, type, content_url } = req.body;
    
    // If type is file and there is an uploaded file
    let finalUrl = content_url;
    if (type === 'file' && req.file) {
      finalUrl = req.file.location || req.file.path; // Depends on multer-s3 / cloudinary
    }

    const manual = await Manual.create({
      title,
      category,
      type,
      content_url: finalUrl
    });

    res.status(201).json(manual);
  } catch (error) {
    console.error('Error creating manual:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateManual = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, type, content_url } = req.body;

    const manual = await Manual.findByPk(id);
    if (!manual) {
      return res.status(404).json({ message: 'Manual not found' });
    }

    let finalUrl = content_url || manual.content_url;
    if (type === 'file' && req.file) {
      finalUrl = req.file.location || req.file.path;
    }

    await manual.update({
      title: title || manual.title,
      category: category || manual.category,
      type: type || manual.type,
      content_url: finalUrl
    });

    res.json(manual);
  } catch (error) {
    console.error('Error updating manual:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteManual = async (req, res) => {
  try {
    const { id } = req.params;
    const manual = await Manual.findByPk(id);
    if (!manual) {
      return res.status(404).json({ message: 'Manual not found' });
    }

    await manual.destroy();
    res.json({ message: 'Manual deleted successfully' });
  } catch (error) {
    console.error('Error deleting manual:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
