pragma solidity ^0.4.17;

contract SimpleStorage {
    uint myVariable;

    // From demo issue #3
    // event Odd();
    // event Even(); 

    function set(uint x) public {
        // assert(x == 0); // From demo issue/bug #2

        myVariable = x;

        // From demo issue #3
        // if (x % 2 == 0) {
        //     Odd();   // maybe need "emit"?
        // } else {
        //     Even();
        // }        
    }

    function get() constant public returns (uint) {
        return myVariable;
    }
}