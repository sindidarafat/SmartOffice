const User = require("../models/User")
const Leave = require("../models/Leave")
const Salary = require("../models/Salary") // Ensure this model is defined with baseAmount, bonus, totalAmount, month, year
const Project = require("../models/Project")
const Task = require("../models/Task")

// @desc    Get all employees
// @route   GET /api/admin/employees
// @access  Private (Admin)
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" })
    res.status(200).json({ success: true, count: employees.length, data: employees })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

// @desc    Get single employee
// @route   GET /api/admin/employees/:id
// @access  Private (Admin)
exports.getEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id)
    if (!employee || employee.role !== "employee") {
      return res.status(404).json({ success: false, error: "Employee not found" })
    }
    res.status(200).json({ success: true, data: employee })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

// @desc    Update employee details by Admin
// @route   PUT /api/admin/employees/:id
// @access  Private (Admin)
exports.updateEmployeeDetails = async (req, res) => {
  try {
    const updateFields = { ...req.body }
    if (updateFields.salary !== undefined) {
      const parsedSalary = Number.parseFloat(updateFields.salary)
      if (isNaN(parsedSalary)) {
        return res.status(400).json({ success: false, error: "Invalid salary value provided." })
      }
      updateFields.salary = parsedSalary
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    })
    if (!user) {
      return res.status(404).json({ success: false, error: "Employee not found" })
    }
    res.status(200).json({ success: true, data: user })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

// @desc    Get all leave requests
// @route   GET /api/admin/leaves
// @access  Private (Admin)
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate("employee", "name email")
    res.status(200).json({ success: true, count: leaves.length, data: leaves })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

// @desc    Manage leave request (approve/reject)
// @route   PUT /api/admin/leaves/:id
// @access  Private (Admin)
exports.manageLeaveRequest = async (req, res) => {
  try {
    const { status } = req.body
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" })
    }
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      },
    )
    if (!leave) {
      return res.status(404).json({ success: false, error: "Leave request not found" })
    }
    res.status(200).json({ success: true, data: leave })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

// @desc    Get all salary records
// @route   GET /api/admin/salary
// @access  Private (Admin)
exports.getSalaries = async (req, res) => {
  try {
    // Populate employee details and select specific fields from Salary model
    const salaries = await Salary.find().populate("employee", "name email position address")
    res.status(200).json({ success: true, count: salaries.length, data: salaries })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

// @desc    Process (create) a new salary record
// @route   POST /api/admin/salary
// @access  Private (Admin)
exports.processSalary = async (req, res) => {
  try {
    const { employee: employeeId, bonus, month, year } = req.body

    // Fetch the employee's current base salary from their User profile
    const employee = await User.findById(employeeId)
    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" })
    }
    if (employee.salary === undefined || employee.salary === null) {
      return res
        .status(400)
        .json({ success: false, error: "Employee base salary not set. Please set it in employee details first." })
    }

    const baseAmount = Number.parseFloat(employee.salary)
    if (isNaN(baseAmount)) {
      // Add this check for NaN
      return res.status(400).json({ success: false, error: "Employee base salary is not a valid number." })
    }

    const parsedBonus = Number.parseFloat(bonus) || 0
    const totalAmount = baseAmount + parsedBonus

    const salaryRecord = await Salary.create({
      employee: employeeId,
      baseAmount,
      bonus: parsedBonus,
      totalAmount,
      month: Number.parseInt(month),
      year: Number.parseInt(year),
    })

    res.status(201).json({ success: true, data: salaryRecord })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

// @desc    Update a salary record
// @route   PUT /api/admin/salary/:id
// @access  Private (Admin)
exports.updateSalary = async (req, res) => {
  try {
    const { bonus, month, year } = req.body

    const salaryRecord = await Salary.findById(req.params.id)
    if (!salaryRecord) {
      return res.status(404).json({ success: false, error: "Salary record not found" })
    }

    // Update fields if provided
    if (bonus !== undefined) salaryRecord.bonus = Number.parseFloat(bonus) || 0
    if (month !== undefined) salaryRecord.month = Number.parseInt(month)
    if (year !== undefined) salaryRecord.year = Number.parseInt(year)

    // Recalculate totalAmount based on the original baseAmount and potentially new bonus
    salaryRecord.totalAmount = salaryRecord.baseAmount + salaryRecord.bonus

    await salaryRecord.save()

    res.status(200).json({ success: true, data: salaryRecord })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

// @desc    Delete a salary record
// @route   DELETE /api/admin/salary/:id
// @access  Private (Admin)
exports.deleteSalary = async (req, res) => {
  try {
    const salary = await Salary.findByIdAndDelete(req.params.id)
    if (!salary) {
      return res.status(404).json({ success: false, error: "Salary record not found" })
    }
    res.status(200).json({ success: true, data: {} })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

// @desc    Get all projects
// @route   GET /api/admin/projects
// @access  Private (Admin)
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
    res.status(200).json({ success: true, count: projects.length, data: projects })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

// @desc    Create a new project
// @route   POST /api/admin/projects
// @access  Private (Admin)
exports.createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body)
    res.status(201).json({ success: true, data: project })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

// @desc    Get all tasks
// @route   GET /api/admin/tasks
// @access  Private (Admin)
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate("project", "name").populate("employee", "name")
    res.status(200).json({ success: true, count: tasks.length, data: tasks })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

// @desc    Create a new task and assign it
// @route   POST /api/admin/tasks
// @access  Private (Admin)
exports.createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body)
    res.status(201).json({ success: true, data: task })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

// @desc    Get employee progress report
// @route   GET /api/admin/employees/:id/progress
// @access  Private (Admin)
exports.getEmployeeProgressReport = async (req, res) => {
  try {
    const employeeId = req.params.id
    const tasks = await Task.find({ employee: employeeId }).populate("project", "name")
    if (!tasks || tasks.length === 0) {
      return res.status(200).json({
        success: true,
        data: { message: "No tasks assigned to this employee.", progress: 0 },
      })
    }
    const completedTasks = tasks.filter((task) => task.status === "completed").length
    const totalTasks = tasks.length
    const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        progress: `${progressPercentage.toFixed(2)}%`,
        tasks,
      },
    })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

// @desc    Get salary history for a specific employee
// @route   GET /api/admin/employees/:id/salary-history
// @access  Private (Admin)
exports.getEmployeeSalaryHistory = async (req, res) => {
  try {
    const employeeId = req.params.id
    const salaries = await Salary.find({ employee: employeeId })
      .populate("employee", "name email") // Populate employee details if needed, though not strictly necessary for this view
      .sort({ year: -1, month: -1 }) // Sort by most recent first

    res.status(200).json({ success: true, count: salaries.length, data: salaries })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: "employee" })
    const pendingLeaves = await Leave.countDocuments({ status: "pending" })
    const totalProjects = await Project.countDocuments()
    const completedTasks = await Task.countDocuments({ status: "completed" })
    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        pendingLeaves,
        totalProjects,
        completedTasks,
      },
    })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}
