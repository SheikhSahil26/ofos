import bcrypt from 'bcrypt'

const saltRound = 10;

export const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, saltRound);
}

export const comparePassword =async(password:string,hash_password:string) =>{
    return await bcrypt.compare(password,hash_password);
}