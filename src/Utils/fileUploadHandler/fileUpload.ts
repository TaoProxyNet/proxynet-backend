import {v2 as cloudinary} from 'cloudinary';
import multer from "multer";
import path from "path";
import CustomError from "@/Utils/errors/customError.class";
import * as fs from "fs";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // cb(null, 'uploads/')
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname)
        // console.log({ext})
        const baseName = file.originalname.trim()?.split('.')[0]?.replace(/\s+/g, '-')
        // console.log({baseName})
        const newFileName = `${baseName + "-" + new Date().toISOString()}${ext}`
        // console.log({newFileName})
        cb(null, newFileName)
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024
    },
    fileFilter: function (req, file, cb) {
        const allowedMimes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'image/avif',
            'image/jpg',
            'image/svg'
        ]

        console.log(file.originalname, file.mimetype)

        if (!allowedMimes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only image file allowed.'))
        }
        cb(null, true)
    }
})

const uploadToCloudinary = async ({
                                      file, folderName, public_id
                                  }: {
    file: Express.Multer.File, folderName: string, public_id: string
}): Promise<{
    url: string;
    fileName: string
}> => {
    try {
        const data = await cloudinary.uploader.upload(file.path,
            {public_id, folder: folderName}
        );
        data.url && fs.unlinkSync(file.path);
        // console.log('from upload to cloudinary function', {data})
        return {
            url: data.secure_url,
            fileName: data.original_filename
        }
    } catch (e) {
        console.log()
        // throw new CustomError((e as Error).message, 400)
        throw e
    }
}
const deleteFileFromCloudinary = async (url: string) => {
    try {
        const parts = url.split('/');
        const fileName = parts.pop() || ''; // Get the last part of the URL
        const fileExtension = fileName.split('.').pop() || ''; // Get the file extension
        const publicId = parts.slice(7).join('/') + '/' + fileName.replace('.' + fileExtension, ''); // Remove the file extension and join the remaining parts
        return cloudinary.uploader.destroy(publicId);
    } catch (e) {
        throw new CustomError((e as Error).message, 400)
    }
}

const deleteFolderFromCloudinary = async (url: string) => {
    try {
        const parts = url.split('/');
        const fileName = parts.pop() || ''; // Get the last part of the URL
        const folderPath = parts.slice(7, 10).join('/') // Remove the file extension and join the remaining parts
        // Delete all resources within the folder
        await cloudinary.api.delete_resources_by_prefix(folderPath);

        // Delete the folder itself
        return cloudinary.api.delete_folder(folderPath);
    } catch (e) {
        console.log((e as any).error);
        throw new CustomError((e as Error).message, 400);
    }
}


export const FileUploadHandler = {
    upload,
    uploadToCloudinary,
    deleteFileFromCloudinary,
    deleteFolderFromCloudinary
}