import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box, Button, Input, FormControl, FormLabel, VStack, Text, useToast
} from "@chakra-ui/react";

const CreatePage = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [dateFound, setDateFound] = useState("");
    const [image, setImage] = useState(null);
    const navigate = useNavigate();
    const toast = useToast();

    const handleImageChange = (e) => {
        setImage(e.target.files[0]); // Store image file
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("dateFound", dateFound);
        if (image) formData.append("image", image); // Append image if exists

        try {
            const response = await fetch("http://localhost:3000/api/items", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                toast({ title: "Item Created", status: "success", duration: 3000 });
                navigate("/");
            } else {
                toast({ title: "Error", description: data.message, status: "error", duration: 3000 });
            }
        } catch (error) {
            toast({ title: "Server Error", status: "error", duration: 3000 });
        }
    };

    return (
        <Box maxW="400px" mx="auto" mt="50px" p="6" boxShadow="lg" borderRadius="md">
            <form onSubmit={handleSubmit}>
                <VStack spacing="4">
                    <FormControl isRequired>
                        <FormLabel>Name</FormLabel>
                        <Input type="text" placeholder="Enter item name" value={name} onChange={(e) => setName(e.target.value)} />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Description</FormLabel>
                        <Input type="text" placeholder="Enter description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Date Found</FormLabel>
                        <Input type="date" value={dateFound} onChange={(e) => setDateFound(e.target.value)} />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Upload Image</FormLabel>
                        <Input type="file" accept="image/*" onChange={handleImageChange} />
                    </FormControl>

                    <Button colorScheme="blue" type="submit" width="full">Submit</Button>
                </VStack>
            </form>
        </Box>
    );
};

export default CreatePage;
