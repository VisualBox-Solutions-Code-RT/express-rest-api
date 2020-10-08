USE [express]
GO
/****** Object:  Schema [Node]    Script Date: 08/10/2020 11:50:52 ******/
CREATE SCHEMA [Node]
GO
/****** Object:  Table [Node].[LoginDates]    Script Date: 08/10/2020 11:50:52 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Node].[LoginDates](
	[UserId] [int] NOT NULL,
	[Date] [datetime] NOT NULL
) ON [PRIMARY]
GO
/****** Object:  Table [Node].[Roles]    Script Date: 08/10/2020 11:50:52 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Node].[Roles](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](50) NOT NULL
) ON [PRIMARY]
GO
/****** Object:  Table [Node].[UserRoles]    Script Date: 08/10/2020 11:50:52 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Node].[UserRoles](
	[UserId] [int] NOT NULL,
	[RoleId] [int] NOT NULL
) ON [PRIMARY]
GO
/****** Object:  Table [Node].[Users]    Script Date: 08/10/2020 11:50:52 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Node].[Users](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Guid] [nvarchar](50) NOT NULL,
	[Email] [nvarchar](50) NOT NULL,
	[PasswordHash] [nvarchar](500) NOT NULL,
	[PasswordSalt] [nvarchar](50) NOT NULL,
	[EmailConfirmed] [bit] NOT NULL,
	[AccountLocked] [bit] NOT NULL,
	[TwoFactorEnabled] [bit] NOT NULL,
	[TwoFactorSecret] [nvarchar](50) NULL,
	[IsDeleted] [bit] NULL,
	[FirstName] [nvarchar](20) NULL,
	[LastName] [nvarchar](20) NULL
) ON [PRIMARY]
GO
/****** Object:  StoredProcedure [Node].[spGetAppRoles]    Script Date: 08/10/2020 11:50:52 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [Node].[spGetAppRoles]

AS

SELECT [Id]
      ,[Name]
  FROM [Node].[Roles]
GO
/****** Object:  StoredProcedure [Node].[spGetAppUserByEmail]    Script Date: 08/10/2020 11:50:52 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [Node].[spGetAppUserByEmail]
@Email nvarchar(50)

AS

SELECT [Id]
	  ,[Guid]
      ,[PasswordHash]
      ,[PasswordSalt]
	  ,[EmailConfirmed]
	  ,[AccountLocked]
	  ,[TwoFactorEnabled]
	  ,[TwoFactorSecret]
	  ,[FirstName]
	  ,[LastName]
FROM [Node].[Users]
WHERE [Email] = @Email


GO
/****** Object:  StoredProcedure [Node].[spGetAppUserRoles]    Script Date: 08/10/2020 11:50:52 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [Node].[spGetAppUserRoles]
@Guid nvarchar(50)

AS

SELECT [Name]
  FROM [Node].[Roles] r
  LEFT JOIN [Node].[UserRoles] ur ON r.Id = ur.RoleId
  LEFT JOIN [Node].[Users] u ON ur.UserId = u.Id
  WHERE u.Guid = @Guid
GO
/****** Object:  StoredProcedure [Node].[spGetAppUsers]    Script Date: 08/10/2020 11:50:52 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [Node].[spGetAppUsers]
@Guid nvarchar(50)

AS

SELECT u.[Id]
	  ,[Guid]
      ,[Email]
	  ,ISNULL([FirstName], '') AS 'FirstName'
	  ,ISNULL([LastName], '') AS 'LastName'
      ,[PasswordHash]
      ,[PasswordSalt]
      ,[EmailConfirmed] 
      ,[AccountLocked]
      ,[TwoFactorEnabled]
	  ,ISNULL(IsDeleted, 0) AS 'IsDeleted'

  FROM [Node].[Users] u
  LEFT JOIN [Node].[UserRoles] ur ON u.Id = ur.UserId
  WHERE ([Guid] = @Guid OR @Guid IS NULL)
	AND ISNULL(IsDeleted, 0) = 0


-- exec [Node].[spGetAppUsers] NULL
GO
/****** Object:  StoredProcedure [Node].[spInsertAppUser]    Script Date: 08/10/2020 11:50:52 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [Node].[spInsertAppUser]
@Guid nvarchar(50),
@Email nvarchar(50),
@PasswordHash nvarchar(500),
@PasswordSalt nvarchar(50),
@EmailConfirmed bit,
@AccountLocked bit,
@TwoFactorEnabled bit

AS

-- Application checks for duplicate existing email address
IF NOT EXISTS (SELECT 1 FROM [Node].[Users] WHERE [Guid] = @Guid)
	BEGIN
		INSERT INTO [Node].[Users]
				   ([Guid]
				   ,[Email]
				   ,[PasswordHash]
				   ,[PasswordSalt]
				   ,[EmailConfirmed]
				   ,[AccountLocked]
				   ,[TwoFactorEnabled])
			 VALUES
				   (@Guid
				   ,@Email
				   ,@PasswordHash
				   ,@PasswordSalt
				   ,@EmailConfirmed
				   ,@AccountLocked
				   ,@TwoFactorEnabled)

		SELECT CAST(@@IDENTITY AS INT) AS 'UserId'
	END
GO
/****** Object:  StoredProcedure [Node].[spInsertDeleteAppUserRole]    Script Date: 08/10/2020 11:50:52 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [Node].[spInsertDeleteAppUserRole]
@UserId int,
@RoleId int

AS

IF NOT EXISTS (SELECT 1 FROM [Node].[UserRoles] WHERE [UserId] = @UserId AND [RoleId] = @RoleId)
BEGIN
	INSERT INTO [Node].[UserRoles]
			   ([UserId]
			   ,[RoleId])
		 VALUES
			   (@UserId
			   ,@RoleId)
END
ELSE
BEGIN
	DELETE FROM [Node].[UserRoles]
		  WHERE [UserId] = @UserId AND [RoleId] = @RoleId

	DECLARE @RoleName nvarchar(50) = (SELECT [Name] FROM [Node].[Roles] WHERE [Id] = @RoleId)

	IF @RoleName = 'Supplier'
	BEGIN
		UPDATE [Node].[Users]
		   SET [SupplierId] = NULL
		 WHERE [Id] = @UserId
	END
END


GO
/****** Object:  StoredProcedure [Node].[spInsertLoginDate]    Script Date: 08/10/2020 11:50:52 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [Node].[spInsertLoginDate]
@Id int

AS

INSERT INTO [Node].[LoginDates]
           ([UserId]
           ,[Date])
     VALUES
           (@Id
           ,GETDATE())

GO
/****** Object:  StoredProcedure [Node].[spInsertUpdateAppRole]    Script Date: 08/10/2020 11:50:52 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [Node].[spInsertUpdateAppRole]
@Id int,
@Name nvarchar(50)

AS

IF NOT EXISTS (SELECT 1 FROM [Node].[Roles] WHERE [Id] = @Id)
BEGIN
INSERT INTO [Node].[Roles]
           ([Name])
     VALUES
           (@Name)

	SELECT CAST(@@IDENTITY AS INT) AS 'RoleId'
END
ELSE
BEGIN
	UPDATE [Node].[Roles]
	   SET [Name] = @Name
	 WHERE [Id] = @Id

	 SELECT @Id AS 'RoleId'
END
GO
/****** Object:  StoredProcedure [Node].[spUpdateAppUser]    Script Date: 08/10/2020 11:50:52 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [Node].[spUpdateAppUser]
@Guid nvarchar(50),
@Email nvarchar(50),
@FirstName nvarchar(20),
@LastName nvarchar(20),
@EmailConfirmed bit,
@AccountLocked bit,
@TwoFactorEnabled bit

AS

UPDATE [Node].[Users]
	SET [Email] = @Email
		,[FirstName] = @FirstName
		,[LastName] = @LastName
		,[EmailConfirmed] = @EmailConfirmed
		,[AccountLocked] = @AccountLocked
		,[TwoFactorEnabled] = @TwoFactorEnabled
	WHERE [Guid] = @Guid
GO
/****** Object:  StoredProcedure [Node].[spUpdateAppUserEmailConfirmation]    Script Date: 08/10/2020 11:50:52 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [Node].[spUpdateAppUserEmailConfirmation]
@Guid nvarchar(50)

AS

UPDATE [Node].[Users]
	SET [EmailConfirmed] = 1
	WHERE [Guid] = @Guid
GO
/****** Object:  StoredProcedure [Node].[spUpdateAppUserPassword]    Script Date: 08/10/2020 11:50:52 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [Node].[spUpdateAppUserPassword]
@Guid nvarchar(50),
@PasswordHash nvarchar(500),
@PasswordSalt nvarchar(50)

AS

UPDATE [Node].[Users]
   SET [PasswordHash] = @PasswordHash
      ,[PasswordSalt] = @PasswordSalt
 WHERE [Guid] = @Guid
GO
/****** Object:  StoredProcedure [Node].[spUpdateAppUserTwoFactorEnabled]    Script Date: 08/10/2020 11:50:52 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROC [Node].[spUpdateAppUserTwoFactorEnabled]
@Guid nvarchar(50),
@Enabled bit,
@TwoFactorSecret nvarchar(50)

AS

UPDATE [Node].[Users]
	SET [TwoFactorEnabled] = @Enabled,
		[TwoFactorSecret] = @TwoFactorSecret
	WHERE [Guid] = @Guid
GO
