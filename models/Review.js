const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        maxlength: 100
    },
    text: {
        type: String,
        required: [true, 'Please add some text']
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please add a rating between 1 and 10']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
});

// Make sure user can add only one review per bootcamp
reviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

reviewSchema.statics.getAverageRating = async function (bootcampId) {
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: '$bootcamp',
                averageRating: { $avg: '$rating' }
            }
        }
    ]);

    try {
        const averageRating = obj[0].averageRating;
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageRating
        });
    } catch (error) {
        console.log(error);
    }
};

reviewSchema.post('save', async function () {
    await this.constructor.getAverageRating(this.bootcamp);
});

reviewSchema.pre('remove', async function () {
    await this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Review', reviewSchema);
