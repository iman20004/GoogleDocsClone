const Register = () => {
    return (

        <form action="http://rushhour.cse356.compas.cs.stonybrook.edu/users/signup" method="post">
            <div >
                <h1>Register</h1>
                <p>Please fill in this form to create an account.</p>

                <div>
                    <label for="name"><b>Name</b></label>
                    <input type="text" placeholder="Enter name" name="name" id="name" required></input>

                    <label for="email"><b>Email</b></label>
                    <input type="text" placeholder="Enter Email" name="email" id="email" required></input>

                    <label for="password"><b>Password</b></label>
                    <input type="password" placeholder="Enter Password" name="password" id="password" required></input>
                </div>

                <button type="submit" class="registerbtn">Register</button>
            </div>

            <div>
                <p>Already have an account? <a href="http://rushhour.cse356.compas.cs.stonybrook.edu/login">Login</a>.</p>
            </div>

        </form>

    );
}

export default Register;