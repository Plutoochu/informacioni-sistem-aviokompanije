import mongoose from 'mongoose';

const letSchema = new mongoose.Schema({
  polaziste: {
    type: String,
    required: true
  },
  odrediste: {
    type: String,
    required: true
  },
  datumPolaska: {
    type: Date,
    required: true
  },
  cijena: {
    type: Number,
    required: true
  },
  brojSlobodnihMjesta: {
    type: Number,
    required: true,
    min: 0
  },
  avionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Avion',
    required: true
  }
}, {
  timestamps: true
});

const Let = mongoose.model('Let', letSchema);

export default Let; 