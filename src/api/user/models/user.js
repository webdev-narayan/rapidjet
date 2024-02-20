
import { DataTypes } from 'sequelize';
import sequelize from '../../../../database/index.js';

const User = sequelize.define("User",{
        
    name: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
    },
    password: {
        type: DataTypes.STRING,
    }
});

User.sync();

export default User;
          